/**
 * Позиции в Яндексе
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function keywordsPositionGoogle()
{
  let _urllist = {};
  let taskObjects = _post.task_objects;
  let without_domain_matches = false;

  if ( typeof siteOptions[ 'site_url' ] != 'undefined'
        && /^(https?:)?(\/\/)?[^\/?#]+\/.+$/.test( siteOptions[ 'site_url' ] ) )
  {
    without_domain_matches = true;
  }


  if ( typeof siteOptions[ 'competitors' ] != 'undefined' && Object.keys( siteOptions[ 'competitors' ] ).length > 0 )
  {
    for ( competitor_id in siteOptions[ 'competitors' ] )
    {
      if ( typeof _post[ 'subregexp_competitors' ] != 'undefined' && typeof _post[ 'subregexp_competitors' ][ competitor_id ] != 'undefiend' )
      {
        _post[ 'subregexp_competitors' ][ competitor_id ] = new RegExp( _post[ 'subregexp_competitors' ][ competitor_id ] );
      }

      let r = new RegExp( '^(?:(?:https?:)?\/\/)?(?:www\.)?([^\/\?]+)[\/?]$' );
      if ( r.test( siteOptions[ 'competitors' ][ competitor_id ] ) )
      {
        siteOptions[ 'competitors' ][ competitor_id ] = siteOptions[ 'competitors' ][ competitor_id ].replace( r, '$1' );
      }
    }
  }


  /**
   * Обработка объектов задания
   */
  tasksCycle:
  for ( var ti in taskObjects )
  {
    /**
     * Настройка переменных
     */
    google.lastSearchPage = false;
    var resultsNumber = 0;
    var prevPageResultsNumber = 0;
    var wrongUrls = {};
    let site_url = false;

    /**
     * Пропускаем обработку, если пустое ключевое слово
     */
    if ( !php.trim( taskObjects[ ti ][ 'keyword' ] ) )
    {
      taskObjects[ ti ][ 'result' ] = {
        found: false,
        wrong_urls: wrongUrls
      };

      continue tasksCycle;
    }
/*
    if ( typeof taskObjects[ti]['incomplete_match_uri'] === 'undefined' )
    {
      taskObjects[ti]['incomplete_match_uri']
    }
*/
    /**
     * Настройка региона, языкового домена и юзерагента
     */
    if ( taskObjects[ti]['region'] != undefined )
    {
      google.region = taskObjects[ti]['region'];

      if ( siteOptions['google']['position_regions'][google.region] != undefined
          && siteOptions['google']['position_regions'][google.region]['domain'] != undefined
          && php.trim( siteOptions['google']['position_regions'][google.region]['domain'] ) )
      {
        google.domain = siteOptions['google']['position_regions'][google.region]['domain'];
      }

      if ( taskObjects[ti]['device'] != undefined )
      {
        await seoa.setFingerprint( taskObjects[ti]['device'] );
      }

      if ( siteOptions['google']['position_regions'][google.region] != undefined
          && siteOptions['google']['position_regions'][google.region]['search_depth'] != undefined )
      {
        google.searchDepth = siteOptions['google']['position_regions'][google.region]['search_depth'];
      }
      else
      {
        google.searchDepth = 100;
      }
    }
    else
    {
      google.region = google.mainRegion;
      google.searchDepth = 100;
    }


    /**
     * Настройка регулярного выражения для субдоменов
     */
    if ( php.trim( siteOptions[ 'positions_with_subdomains' ] ) )
    {
      var subregexp = new RegExp( '(^|(^.+\\.))' + php.pregQuote( seoa.siteDomain( taskObjects[ti]['page_uri'] ) ) + '$', 'i' );
    }


    if ( typeof _post[ 'get_all_urls' ] != 'undefined' )
    {
      _urllist[ taskObjects[ti]['keyword'] ] = [];
    }



    /**
     * Обрабатывать страницы пагинации в поиске,
     * пока количество результатов не будет больше чем 90% от значения глубины поиска
     */

    let page_number = 0;
    let start_time = new Date().getTime();
    captchaSolver.stats = [];

    while ( resultsNumber < google.searchDepth * 0.91 )
    {
      page_number ++;

      /**
       * Результаты поиска
       */
      var searchResults = await google.getSearchResults( taskObjects[ti]['keyword'], true );

//console.log( searchResults );
/*
let page_url = await page.url();
let fname = md5( taskObjects[ti]['keyword'] ) + ' - ' + md5( page_url );
let content = await page.content();
fs.writeFileSync( rootPath + '/' + fname + '.html', taskObjects[ti]['keyword'] + '\n\n' + page_url + '\n\n' + content );
*/

//fs.writeFileSync( rootPath + '/' + taskObjects[ti]['keyword'] + '+' + page_number + '.html', await page.content() );

      /**
       * Прерывание задания в случае ошибки или большого количества капч
       */
      const page_content = php.trim( await page.content() );

      if ( php.inArray( searchResults, [ 'stop', '' ] )
              ||
            php.inArray( page_content, [ '', '<html><head></head><body></body></html>' ] )
              ||
            page_content.indexOf( '</html>' ) < 0 )
      {
        if ( resultsNumber < 70 || !page_content || page_content == '<html><head></head><body></body></html>' )
        {
          if ( typeof taskObjects[ ti ][ 'result' ] != 'undefined' )
          {
            delete taskObjects[ ti ][ 'result' ];
          }

          taskObjects[ ti ][ 'parsing_stats' ] = {
            'handler' : 'browser',
            'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
            'captcha_stats' : captchaSolver.stats,
            'pages' : page_number
          };

          return taskObjects;
        }
        else
        {
          break;
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
       * Обработка результатов поска
       */
      for ( var position in searchResults )
      {
        resultsNumber ++;

        if ( resultsNumber > google.searchDepth )
        {
          if ( typeof taskObjects[ ti ][ 'result' ] == 'undefined' )
          {
            taskObjects[ ti ][ 'result' ] = {
              found: false,
              wrong_urls: wrongUrls
            };
          }

          taskObjects[ ti ][ 'parsing_stats' ] = {
            'handler' : 'browser',
            'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
            'captcha_stats' : captchaSolver.stats,
            'pages' : page_number
          };

          continue tasksCycle;
        }


        position *= 1;


        /**
         * Позиции конкурентов
         */
        if ( typeof siteOptions[ 'competitors' ] != 'undefined' && Object.keys( siteOptions[ 'competitors' ] ).length > 0 )
        {
          for ( competitor_id in siteOptions[ 'competitors' ] )
          {
            if ( typeof taskObjects[ ti ][ 'competitors' ] == 'undefined'
                  ||
                typeof taskObjects[ ti ][ 'competitors' ][ competitor_id ] == 'undefined' )
            {
              let competitor_url = siteOptions[ 'competitors' ][ competitor_id ];
              let found = false;

              if ( !/[?\/]/.test( competitor_url ) )
              {
                if ( searchResults[ position ][ 'site' ] == competitor_url
                    ||
                    (
                      typeof _post[ 'subregexp_competitors' ] != 'undefined'
                        &&
                      typeof _post[ 'subregexp_competitors' ][ competitor_id ] != 'undefined'
                        &&
                      _post[ 'subregexp_competitors' ][ competitor_id ].test( seoa.siteDomain( searchResults[ position ]['site'] ) )
                    )
                   )
                {
                  found = true;
                }
              }
              else
              {
                let results_url = seoa.urlToCompare( searchResults[ position ]['page_url'] );
                let regexp = new RegExp( '^' + seoa.urlToCompare( competitor_url ) );

                if ( regexp.test( results_url ) )
                {
                  found = true;
                }
/*
                result = seoa.checkUrlMatching(
                  competitor_url,
                  searchResults[ position ]['page_url'],
                  prevPageResultsNumber + position
                );

                if ( result.found )
                {
                  found = true;
                }
*/
              }

              if ( found )
              {
                if ( typeof taskObjects[ ti ][ 'competitors' ] == 'undefined' )
                {
                  taskObjects[ ti ][ 'competitors' ] = {};
                }

                if ( typeof _post[ 'api' ] != 'undefined' )
                {
                  taskObjects[ ti ][ 'competitors' ][ competitor_id ] = {
                    'position' : prevPageResultsNumber + position,
                    'relevance_url' : searchResults[ position ]['page_url']
                  };
                }
                else
                {
                  taskObjects[ ti ][ 'competitors' ][ competitor_id ] = prevPageResultsNumber + position;
                }
              }
            }
          }


          taskObjects[ ti ][ 'parsing_stats' ] = {
            'handler' : 'browser',
            'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
            'captcha_stats' : captchaSolver.stats,
            'pages' : page_number
          };


          /**
           * Возможно придется удалить из-за wrong-urls
           */
          if ( typeof taskObjects[ ti ][ 'competitors' ] != 'undefined'
                && typeof _post[ 'get_all_urls' ] == 'undefined'
                &&  typeof taskObjects[ ti ][ 'result' ] != 'undefined' && typeof taskObjects[ ti ][ 'result' ][ 'found' ] != 'undefined'
                && taskObjects[ ti ][ 'result' ][ 'found' ]
                && Object.keys( taskObjects[ ti ][ 'competitors' ] ).length == Object.keys( siteOptions[ 'competitors' ] ).length  )
          {
            continue tasksCycle;
          }
        }
        else if ( typeof _post[ 'get_all_urls' ] != 'undefined' )
        {
          _urllist[ taskObjects[ti]['keyword'] ].push( searchResults[ position ]['page_url'] );
        }


        if ( typeof taskObjects[ ti ][ 'result' ] == 'undefined' )
        {
          /**
           * Сравнение по урл
           */
          if ( taskObjects[ti]['page_uri'].indexOf( '/' ) > -1
              || /^(https?:)?(\/\/)?[^\/?#]+[\/?#]/.test( taskObjects[ti]['page_uri'] ) )
          {
            result = seoa.checkUrlMatching(
              taskObjects[ti]['page_uri'],
              searchResults[ position ]['page_url'],
              prevPageResultsNumber + position,
              false,
              without_domain_matches
            );

            if ( result.found )
            {
              taskObjects[ ti ][ 'result' ] = {
                found: prevPageResultsNumber + position,
                found_url: searchResults[ position ][ 'page_url' ],
                wrong_urls: {}
              }

              taskObjects[ ti ][ 'parsing_stats' ] = {
                'handler' : 'browser',
                'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
                'captcha_stats' : captchaSolver.stats,
                'pages' : page_number
              };


              if (  typeof _post[ 'get_all_urls' ] == 'undefined'
                    && ( typeof siteOptions[ 'competitors' ] == 'undefined' || Object.keys( siteOptions[ 'competitors' ] ).length < 1 ) )
              {
                continue tasksCycle;
              }
            }
            else
            {
              result = seoa.checkUrlMatching(
                taskObjects[ti]['page_uri'],
                searchResults[ position ]['page_url'],
                prevPageResultsNumber + position,
                taskObjects[ti]['incomplete_match_uri'],
                without_domain_matches
              );

              if ( result.found )
              {
                taskObjects[ ti ][ 'result' ] = {
                  found: prevPageResultsNumber + position,
                  found_url: searchResults[ position ][ 'page_url' ],
                  wrong_urls: {}
                }

                taskObjects[ti]['result']['wrong_urls'][ searchResults[ position ]['page_url'] ] = prevPageResultsNumber + position;

                taskObjects[ ti ][ 'parsing_stats' ] = {
                  'handler' : 'browser',
                  'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
                  'captcha_stats' : captchaSolver.stats,
                  'pages' : page_number
                };


                if (  typeof _post[ 'get_all_urls' ] == 'undefined'
                      && ( typeof siteOptions[ 'competitors' ] == 'undefined' || Object.keys( siteOptions[ 'competitors' ] ).length < 1 ) )
                {
                  continue tasksCycle;
                }
              }
              else
              {
                for ( var wk in result.wrong_urls )
                {
                  wrongUrls[wk] = prevPageResultsNumber + result.wrong_urls[ wk ] * 1;
                }
              }
            }
          }
          /**
           * Сравнение по домену, если в объекте задан домен, вместо урл
           */
          else if ( taskObjects[ti]['page_uri'] == searchResults[ position ]['site']
                    ||
                    (
                      php.trim( siteOptions[ 'positions_with_subdomains' ] )
                        &&
                      subregexp.test( seoa.siteDomain( searchResults[ position ]['site'] ) )
                    )
                  )
          {
            taskObjects[ti]['result'] = {
              found: prevPageResultsNumber + position,
              found_url: searchResults[ position ][ 'page_url' ],
              wrong_urls: {}
            }
            taskObjects[ti]['result']['wrong_urls'][ searchResults[ position ]['page_url'] ] = prevPageResultsNumber + position;

            taskObjects[ ti ][ 'parsing_stats' ] = {
              'handler' : 'browser',
              'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
              'captcha_stats' : captchaSolver.stats,
              'pages' : page_number
            };

            if ( typeof _post[ 'get_all_urls' ] == 'undefined'
                  && ( typeof siteOptions[ 'competitors' ] == 'undefined' || Object.keys( siteOptions[ 'competitors' ] ).length < 1 ) )
            {
              continue tasksCycle;
            }
          }
        }
      }


      prevPageResultsNumber += Object.keys( searchResults ).length;

      /**
       * Определение следующей страницы поиска
       */

      if ( ( resultsNumber < google.searchDepth * 0.91 ) )
      {
        var nextPage = await google.nextPage( resultsNumber );
        if ( nextPage )
        {
          if ( nextPage == 'stop' )
          {
            const page_content = php.trim( await page.content() );

            if ( php.inArray( searchResults, [ 'stop', '' ] )
                    ||
                  php.inArray( page_content, [ '', '<html><head></head><body></body></html>' ] )
                    ||
                  page_content.indexOf( '</html>' ) < 0 )
            {
              if ( typeof taskObjects[ ti ][ 'result' ] != 'undefined' )
              {
                delete taskObjects[ ti ][ 'result' ];
              }

              taskObjects[ ti ][ 'parsing_stats' ] = {
                'handler' : 'browser',
                'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
                'captcha_stats' : captchaSolver.stats,
                'pages' : page_number
              };

              return taskObjects;
            }
            else
            {
              break;
            }
          }
          else
          {
            await seoa.pageLoad( nextPage, google.waitSelector );

            if ( await google.checkCaptcha() === 'stop' )
            {
              const page_content = php.trim( await page.content() );

              if ( php.inArray( searchResults, [ 'stop', '' ] )
                      ||
                    php.inArray( page_content, [ '', '<html><head></head><body></body></html>' ] )
                      ||
                    page_content.indexOf( '</html>' ) < 0 )
              {
                if ( typeof taskObjects[ ti ][ 'result' ] != 'undefined' )
                {
                  delete taskObjects[ ti ][ 'result' ];
                }

                taskObjects[ ti ][ 'parsing_stats' ] = {
                  'handler' : 'browser',
                  'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
                  'captcha_stats' : captchaSolver.stats,
                  'pages' : page_number
                };

                return taskObjects;
              }
              else
              {
                break;
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

    /**
     * Установка значения "не найдено"
     */
    if ( typeof taskObjects[ ti ][ 'result' ] == 'undefined' )
    {
      taskObjects[ti]['result'] = {
        found: false,
        wrong_urls: wrongUrls
      };
    }


    taskObjects[ ti ][ 'parsing_stats' ] = {
      'handler' : 'browser',
      'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
      'captcha_stats' : captchaSolver.stats,
      'pages' : page_number
    };
  }


  if ( typeof _post[ 'get_all_urls' ] != 'undefined' )
  {
    let data_dir = rootPath + '/tmp/' + serverName + '/services/urllist';
    if( !fs.existsSync( data_dir ) )
    {
      seoa.mkdirRecursive( data_dir );
    }

    fs.writeFileSync(
      data_dir + '/' + md5( _post[ 'task_id' ] + _post[ 'thread_id' ] ) + '.json',
      JSON.stringify( _urllist )
    );
  }

  return taskObjects;
}

module.exports = keywordsPositionGoogle;
