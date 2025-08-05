/**
 * Анализ ТОП Яндекса
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function competitors()
{
  let output = {};
  let search_engine = _post[ 'search_engine' ];

  if ( search_engine == 'yandex' )
  {
    var se = yandex;
  }
  else
  {
    var se = google;
  }

  if ( !Array.isArray( seoaOptions[ 'competitors' ][ 'stop_domains' ] ) )
  {
    /**
     * Подготовка списка стоп доменов
     */
    seoaOptions[ 'competitors' ][ 'stop_domains' ] = seoaOptions[ 'competitors' ][ 'stop_domains' ].split( "\n" );
    for ( let ci = 0; ci < seoaOptions[ 'competitors' ][ 'stop_domains' ].length; ci++ )
    {
      let stop_domain = seoaOptions[ 'competitors' ][ 'stop_domains' ][ ci ];
      stop_domain = php.pregQuote( stop_domain, '/' );
      stop_domain = '^' + stop_domain.replace(/\\\*/g, '.*') + '$';
      seoaOptions[ 'competitors' ][ 'stop_domains' ][ ci ] = new RegExp( stop_domain, 'i' );
    }
  }


  if ( siteOptions[ search_engine ][ 'position_regions' ][ se.mainRegion ] != undefined )
  {
    se.region = se.mainRegion;

    if ( siteOptions[ search_engine ][ 'position_regions' ][ se.region ][ 'domain' ] != undefined
        && php.trim( siteOptions[ search_engine ][ 'position_regions' ][ se.region ][ 'domain' ] ) )
    {
      se.domain = siteOptions[ search_engine ][ 'position_regions' ][ se.region ][ 'domain' ];
      await seoa.setFingerprint( siteOptions[ search_engine ][ 'position_regions' ][ se.region ][ 'device' ] );
    }
  }

  /**
   * Настройка количества результатов
   */
  //await se.setResultsNumber();
  if ( typeof _post[ 'results_number' ] != 'undefined' )
  {
    se.searchDepth = _post[ 'results_number' ];
  }
  else
  {
    se.searchDepth = 10;
  }


  /**
   * Получение списка результатов
   */

  let searchResults = [];

  searchResultsCycle:
  while ( searchResults.length < se.searchDepth * 0.91 )
  {
//console.log( searchResults.length );
    /**
     * Результаты поиска
     */
    let results = await se.getSearchResults( _post[ 'keyword' ], true );

    /**
     * Прерывание задания в случае ошибки или большого количества капч
     */
/*
    if ( php.inArray( results, [ 'stop', '<html><head></head><body></body></html>' ] ) )
    {
      return null;
    }
*/

//console.log( results );
//fs.writeFileSync( rootPath + '/page-' + searchResults.length + '.html', await page.content() );

//console.log( searchResults.length );
    const page_content = php.trim( await page.content() );

    if ( php.inArray( results, [ 'stop', '' ] )
            ||
          php.inArray( page_content, [ '', '<html><head></head><body></body></html>' ] )
            ||
          page_content.indexOf( '</html>' ) < 0 )
    {
      if ( searchResults.length < 70 || !page_content || page_content == '<html><head></head><body></body></html>' )
      {
        return null;
      }
      else
      {
        break searchResultsCycle;
      }
    }

    if ( results == false )
    {
      break searchResultsCycle;
    }


    for ( let position in results )
    {
      searchResults.push( results[ position ] );
    }


    if ( searchResults.length < se.searchDepth * 0.91 )
    {
      const nextPage = await se.nextPage( searchResults.length );
      if ( nextPage )
      {
        if ( nextPage == 'stop' )
        {
          break searchResultsCycle;
        }
        else if ( nextPage != 'ajax' )
        {
          await seoa.pageLoad( nextPage, se.waitSelector );
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


  if ( _post['dbtable_competitors_sites'] != undefined )
  {
    /**
     * Проверка доменов на вхождение в стоп список
     */
    let siteIdList = [];
    topcycle:
    for ( let position in searchResults )
    {
      position *= 1;
      let siteDomain = searchResults[ position ][ 'site' ];

      for ( let ci = 0; ci < seoaOptions['competitors']['stop_domains'].length; ci++ )
      {
        if ( seoaOptions['competitors']['stop_domains'][ci].test( siteDomain ) )
        {
          continue topcycle;
        }
      }

      siteIdList.push( md5( siteDomain ) );
    }

    /**
     * Проверка наличия данных домена в базе
     */
    let skipSites = [];

    if ( siteIdList.length > 0 )
    {
      const [ dbrows, dbfields ] = await promisePool.query( `
        SELECT site_domain
        FROM ` + _post[ 'dbtable_competitors_sites' ] + `
        WHERE
          site_id IN ("` + siteIdList.join('","') + `")
            AND
          indexing_number > -1
            AND
          updated > DATE_SUB( CURDATE(), INTERVAL 1 DAY )
      ` );

      if ( dbrows.length > 0 )
      {
        for( let i = 0; i < dbrows.length; i++ )
        {
          skipSites.push( dbrows[i]['site_domain'] );
        }
      }
    }
  }

  /**
   * Проверка количества проиндексированных страниц домена
   */
  let indexedPages = {};
  topcycle:
  for ( let position in searchResults )
  {
    position *= 1;
    let siteDomain = searchResults[ position ][ 'site' ];

    for ( let ci = 0; ci < seoaOptions['competitors']['stop_domains'].length; ci++ )
    {
      if ( seoaOptions['competitors']['stop_domains'][ci].test( siteDomain ) )
      {
        continue topcycle;
      }
    }

/*
    if ( indexedPages[ siteDomain ] == undefined )
    {
      se.captchaNumber = 0;
      se.lastSearchPage = false;
      se.searchURL = null;

      if ( _post[ 'dbtable_competitors_sites' ] == undefined )
      {
        if ( search_engine == 'google' )
        {
          //await seoa.changeProxy( search_engine );
        }

        indexedPages[ siteDomain ] = await se.getNumberOfPagesIndexed( siteDomain );

        if ( indexedPages[ siteDomain ] == 'stop' )
        {
          indexedPages[ siteDomain ] = -1;
        }
      }
      else
      {
        if ( _post['page_url'] != undefined )
        {
          var urlMatching = seoa.checkUrlMatching( _post['page_url'], searchResults[ position ][ 'page_url' ] );
        }
        else
        {
          var urlMatching = {
            found: false,
            wrong_urls: {}
          }
        }

        //if ( !php.inArray( siteDomain, skipSites ) )
        if ( !php.inArray( siteDomain, skipSites ) && !urlMatching['found'] && Object.keys( urlMatching['wrong_urls'] ).length < 1 )
        {
          indexedPages[ siteDomain ] = await se.getNumberOfPagesIndexed( siteDomain );

          if ( indexedPages[ siteDomain ] == 'stop' )
          {
            indexedPages[ siteDomain ] = -1;
          }
        }
        else if ( typeof indexedPages[ siteDomain ] == 'undefined' )
        {
          indexedPages[ siteDomain ] = -1;
        }
      }
    }
*/

    indexedPages[ siteDomain ] = -1;

    output[ position ] = {
      'result_number': position + 1,
      'url': searchResults[ position ][ 'page_url' ],
      'title': searchResults[ position ][ 'title' ],
      'indexing_number': indexedPages[ siteDomain ]
    };

    if ( Object.keys( output ).length >= _post[ 'results_number' ] )
    {
      break;
    }
  }

  return output;
}

module.exports = competitors;
