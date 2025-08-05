/**
 * Сниппеты Яндекса
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function snippets()
{
  let data = {};
  let processed = [];
  let parsing_stats = [];

  /**
   * Получение текущих сниппетов задания
   */
  if ( typeof _post.query_key == 'undefined' )
  {
    const [ dbrows, dbfields ] = await promisePool.query( `
      SELECT result
      FROM seoa_services_results
      WHERE task_id  = "` + _post.task_id + `"
    ` );

    if ( dbrows.length > 0 && typeof dbrows[ 0 ][ 'result' ] != 'undefined' && dbrows[ 0 ][ 'result' ].indexOf( '{' ) > -1 )
    {
      data = JSON.parse( dbrows[ 0 ][ 'result' ] );
    }
  }


  yandex.services = [];
  if ( typeof _post[ 'competitors' ] != 'undefined' && Object.keys( _post[ 'competitors' ] ).length > 0 )
  {
    for ( competitor_id in _post[ 'competitors' ] )
    {
      _post[ 'competitors' ][ competitor_id ] = _post[ 'competitors' ][ competitor_id ].replace( /^\/([^\/]+)/, '$1' );

      let r = new RegExp( '^(?:(?:https?:)?\/\/)?(?:www\.)?([^\/\?]+)[\/?]$' );
      if ( r.test( _post[ 'competitors' ][ competitor_id ] ) )
      {
        _post[ 'competitors' ][ competitor_id ] = _post[ 'competitors' ][ competitor_id ].replace( r, '$1' );
      }

      if ( /((^|\/|\.)yandex\.)|((^|\.|\/)yandex\.\w+\/[^\/]\/)/.test( _post[ 'competitors' ][ competitor_id ] ) )
      {
        yandex.services.push( _post[ 'competitors' ][ competitor_id ].replace( /^(https?:)?\/\/(www\.)?/, '' ) );
      }
    }
  }


  /**
   * Настройка количества результатов
   *
  var setResults = true;
  for ( var ki in _post.keywordlist )
  {
    if ( /(^|\()\s*(site|info|url|inurl)\:/.test( _post.keywordlist[ ki ] ) )
    {
      setResults = false;
    }
  }

  if ( setResults )
  {
    await yandex.setResultsNumber();
  }
   */

  tasksCycle:
  for ( var ki in _post.keywordlist )
  {
    /**
     * Настройка переменных
     */
    seoa.service = 'yandex';

    yandex.lastSearchPage = false;
    var resultsNumber = 0;
    var keyword = _post.keywordlist[ ki ];

    if ( _post[ 'region' ] != undefined )
    {
      yandex.region = _post[ 'region' ];

      siteOptions = {
        search_depth: _post.number_of_results,
        yandex: {
          position_regions: {
            region : {
              region_id: yandex.region
            }
          }
        }
      }
    }
    else
    {
      siteOptions = { search_depth: _post.number_of_results };
    }


    /**
     * Обрабатывать страницы пагинации в поиске,
     * пока количество результатов не будет больше чем 90% от значения глубины поиска
     */

    let page_number = 0;
    let start_time = new Date().getTime();
    captchaSolver.stats = [];

    paginationCycle:
    while ( resultsNumber < siteOptions[ 'search_depth' ] * 0.91 )
    {
      page_number ++;

      /**
       * Результаты поиска
       */
      var searchResults = await yandex.getSearchResults( _post.keywordlist[ ki ] );

      /**
       * Прерывание задания в случае большого количества капч
       */
      if ( searchResults == 'stop' )
      {
        processed.push( parsing_stats );
        return processed;
        //break tasksCycle;
      }

      if ( typeof data[ keyword ] == 'undefined' )
      {
        data[ keyword ] = {
          found: await yandex.getNumberOfPagesIndexed(),
          snippets: {}
        }
      }

      /**
       * Переход к следующему объекту задания в случае отсутствия результатов
       */
      if ( searchResults == false )
      {
        continue tasksCycle;
      }

      /**
       * Формирование списка сниппетов
       */
      for ( var position in searchResults )
      {
        resultsNumber ++;

        if ( resultsNumber > siteOptions[ 'search_depth' ] )
        {
          break paginationCycle;
        }

        data[ keyword ][ 'snippets' ][ resultsNumber ] = {
          url:  searchResults[ position ][ 'page_url' ],
          title: searchResults[ position ][ 'title' ],
          description: searchResults[ position ][ 'description' ]
        }
      }

      /**
       * Определение следующей страницы поиска
       */
      if ( typeof searchResults[ -1 ] != 'undefined' )
      {
        break;
      }
      else if ( resultsNumber < siteOptions[ 'search_depth' ] * 0.91 )
      {
        var nextPage = await yandex.nextPage( resultsNumber );
        if ( nextPage )
        {
          if ( nextPage == 'stop' )
          {
            if ( php.trim( await page.content() ) == '<html><head></head><body></body></html>' )
            {
              break;
            }

            processed.push( parsing_stats );
            return processed;
          }
          else if ( nextPage != 'ajax' )
          {
            await seoa.pageLoad( nextPage, yandex.waitSelector );
          }
        }
        else
        {
          break;
        }
      }
      else
      {
        break;
      }
    }

    processed.push( keyword );

    parsing_stats.push({
      'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
      'captcha_stats' : captchaSolver.stats,
      'pages' : page_number
    });



    /**
     * Обновление сниппетов задания
     */
    if ( typeof _post.query_key != 'undefined' )
    {
      await promisePool.query( `
        INSERT INTO seoa_snippets
        SET
          task_id = "` + _post.task_id + `",
          query_key = "` + _post.query_key + `",
          search_engine = "yandex",
          snippets = ` + promisePool.escape( JSON.stringify( data[ keyword ] ) ) + `,
          added = NOW()
        ON DUPLICATE KEY UPDATE
          snippets = VALUES( snippets ),
          added = NOW()
      ` );
    }
    else
    {
      let dbdata = {};
      for ( const keyword in data )
      {
        if ( typeof data[ keyword ][ 'snippets' ] != 'undefined' )
        {
          dbdata[ keyword ] = data[ keyword ][ 'snippets' ];
        }
        else if ( typeof data[ keyword ] != 'undefined' )
        {
          dbdata[ keyword ] = data[ keyword ];
        }
      }

      await promisePool.query( `
        UPDATE seoa_services_results
        SET result = ` + promisePool.escape( JSON.stringify( dbdata ) ) + `
        WHERE task_id = "` + _post.task_id + `"
      ` );
    }
  }


  processed.push( parsing_stats );
  return processed;
}

module.exports = snippets;
