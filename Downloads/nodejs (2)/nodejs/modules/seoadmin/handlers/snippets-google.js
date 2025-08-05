/**
 * Сниппеты Яндекса
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function googleSnippets()
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


  if ( typeof _post[ 'region' ] != 'undefined' && _post[ 'region' ] )
  {
    google.region = _post[ 'region' ][ 'region_id' ];
    google.domain = _post[ 'region' ][ 'domain' ];
    google.setUULE = false;

    siteOptions = {
      'search_depth' : _post[ 'number_of_results' ],
      'google' : {
        'position_regions' : {}
      }
    };
    siteOptions[ 'google' ][ 'position_regions' ][ google.region ] = _post[ 'region' ];
  }
  else if ( typeof siteOptions == 'undefined' )
  {
    siteOptions = { 'search_depth' : _post[ 'number_of_results' ] };
  }


  tasksCycle:
  for ( let ki in _post.keywordlist )
  {
    /**
     * Настройка переменных
     */
    seoa.service = 'google';

    google.lastSearchPage = false;
    let resultsNumber = 0;
    const keyword = _post.keywordlist[ ki ];


    /**
     * Обрабатывать страницы пагинации в поиске,
     * пока количество результатов не будет больше чем 90% от значения глубины поиска
     */

    let page_number = 0;
    let start_time = new Date().getTime();

    paginationCycle:
    while ( resultsNumber < siteOptions[ 'search_depth' ] * 0.91 )
    {
      page_number ++;

      /**
       * Результаты поиска
       */
      const searchResults = await google.getSearchResults( keyword, true );


      /**
       * Прерывание задания в случае большого количества капч
       */
      if ( searchResults == 'stop' )
      {
        if ( resultsNumber >= 70 )
        {
          break;
        }
        else
        {
          processed.push( parsing_stats );
          return processed;
          //break tasksCycle;
        }
      }

      if ( typeof data[ keyword ] == 'undefined' )
      {
        data[ keyword ] = {
          found: await google.getNumberOfPagesIndexed(),
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

      if ( ( resultsNumber < siteOptions[ 'search_depth' ] * 0.91 ) )
      {
        var nextPage = await google.nextPage( resultsNumber );
        if ( nextPage )
        {
          if ( nextPage == 'stop' )
          {
/*
            if ( php.trim( await page.content() ) == '<html><head></head><body></body></html>' )
            {
              break;
            }
*/
            if ( resultsNumber >= 70 )
            {
              break;
            }
            else
            {
              processed.push( parsing_stats );
              return processed;
            }
          }
          else
          {
            await seoa.pageLoad( nextPage, google.waitSelector );

            if ( await google.checkCaptcha() === 'stop' )
            {
              if ( resultsNumber >= 70 )
              {
                break;
              }
              else
              {
                processed.push( parsing_stats );
                return processed;
              }
            }
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


//console.log( data[ keyword ] );

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
          search_engine = "google",
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

module.exports = googleSnippets;
