/**
 * Позиции в Яндексе
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function keywordsPositionYandex()
{
  let _urllist = {};
  let taskObjects = _post.task_objects;
  let without_domain_matches = false;

  if ( typeof siteOptions[ 'site_url' ] != 'undefined'
        && /^(https?:)?(\/\/)?[^\/?#]+\/.+$/.test( siteOptions[ 'site_url' ] ) )
  {
    without_domain_matches = true;
  }


  /**
   * Список внутренних сервисов яндекса
   */
  let yandex_services = [];
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

      if ( /((^|\/|\.)yandex\.)|((^|\.|\/)yandex\.\w+\/[^\/]\/)/.test( siteOptions[ 'competitors' ][ competitor_id ] ) )
      {
        yandex_services.push( siteOptions[ 'competitors' ][ competitor_id ].replace( /^(https?:)?\/\/(www\.)?/, '' ) );
      }
    }
  }

//var auth_status = await yandex.auth( 'https://ya.ru', true );

  /**
   * Обработка объектов задания
   */
  tasksCycle:
  for ( var ti in taskObjects )
  {
    /**
     * Пропускаем обработку, если пустое ключевое слово
     */
    if ( !php.trim( taskObjects[ ti ][ 'keyword' ] ) )
    {
      taskObjects[ti]['result'] = {
        found: false,
        wrong_urls: wrongUrls
      };

      continue tasksCycle;
    }

/*
//dirkey = md5( taskObjects[ ti ][ 'keyword' ] );
dirkey = taskObjects[ ti ][ 'keyword' ];
seoa.mkdirRecursive( 'D:/___profiles/' + dirkey );
fs.writeFileSync( 'D:/___profiles/' + dirkey + '/proxy.json', JSON.stringify( _post[ 'proxy' ] ) );
fs.writeFileSync( 'D:/___profiles/' + dirkey + '/profile.json', JSON.stringify( seoa.fingerprint ) );
*/

    /**
     * Настройка переменных
     */
    yandex.lastSearchPage = false;
    var resultsNumber = 0;
    var prevPageResultsNumber = 0;
    var wrongUrls = {};
    var urllist = {};
    var foundURL = false;
    var foundPosition = false;
    var page_id = taskObjects[ ti ][ 'page_id' ];



    /**
     * Статус проверки текстового фильтра
     */

    if ( _post[ 'txtfilter_indexing' ] != undefined )
    {
      if ( _post[ 'txtfilter_indexing' ][ page_id ] != undefined )
      {
        if ( _post[ 'txtfilter_indexing' ][ page_id ] * 1 < 1 )
        {
          var txtfilter_processing = false;
        }
        else
        {
          var txtfilter_processing = true;
        }
      }
      else if ( _post[ 'txtfilter_indexing' ] < 1 )
      {
        var txtfilter_processing = false;
      }
      else
      {
        var txtfilter_processing = true;
      }
    }
    else if ( _post[ 'txtfilter' ] == undefined || _post[ 'txtfilter' ] == 0 )
    {
      var txtfilter_processing = false;
    }
    else
    {
      var txtfilter_processing = _post[ 'txtfilter' ];
    }


    /**
     * Настройка отпечатка браузера
     */
    if ( taskObjects[ ti ]['device'] != undefined )
    {
      //seoa.device = false;
      await seoa.setFingerprint( taskObjects[ ti ][ 'device' ] );
    }


    /**
     * Настройка региона, языкового домена и юзерагента
     */
    if ( taskObjects[ti]['region'] != undefined )
    {
      yandex.region = taskObjects[ti]['region'];

      if ( siteOptions['yandex']['position_regions'][yandex.region] != undefined
          && siteOptions['yandex']['position_regions'][yandex.region]['domain'] != undefined
          && php.trim( siteOptions['yandex']['position_regions'][yandex.region]['domain'] ) )
      {
        yandex.domain = siteOptions['yandex']['position_regions'][yandex.region]['domain'];
      }

      if ( siteOptions['yandex']['position_regions'][yandex.region] != undefined
          && siteOptions['yandex']['position_regions'][yandex.region]['search_depth'] != undefined )
      {
        yandex.searchDepth = siteOptions['yandex']['position_regions'][yandex.region]['search_depth'];
      }
      else
      {
        yandex.searchDepth = 100;
      }
    }
    else
    {
      yandex.region = yandex.mainRegion;
      yandex.searchDepth = 100;
    }

    /**
     * Настройка количества результатов
     *
     * Яндекс отключил возможность настройки количества результатов
     *
    if ( !yandex.resultsNumberIsSetted )
    {
      await yandex.setResultsNumber();
    }
     */


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

    yandex.services = yandex_services;

    if ( /(\.yandex\.)|((^|\.|\/)yandex\.\w+\/[^\/]\/)/.test( taskObjects[ti]['page_uri'] ) )
    {
      yandex.services.push( taskObjects[ti]['page_uri'].replace( /^(https?:)?\/\/(www\.)?/, '' ) );
    }


    let page_number = 0;
    let start_time = new Date().getTime();
    captchaSolver.stats = [];

    paginationCycle:
    while ( resultsNumber < yandex.searchDepth * 0.91 )
    {
      page_number ++;

      /**
       * Результаты поиска
       */
      let searchResults = await yandex.getSearchResults( taskObjects[ ti ][ 'keyword' ] );

/*
fs.writeFileSync(
  'D:/___profiles/' + dirkey + '/' + page_number + '.html',
  await page.url() + "\n" + await page.content()
);
*/

//await console.log( await page.url() );

/*
page_number ++;

fs.writeFileSync(
  rootPath + '/_errors/0' + String( page_number ) + '.html',
  await page.content()
);
//*/

      /**
       * Прерывание задания в случае ошибки или большого количества капч
       */
      if ( php.inArray( searchResults, [ 'stop', '<html><head></head><body></body></html>' ] ) )
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

        //console.log( captchaSolver.stats );
        return taskObjects;
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


//console.log( taskObjects[ ti ][ 'keyword' ] + ' | ' + searchResults[ position ][ 'page_url' ] );


        if ( resultsNumber > yandex.searchDepth )
        {
          if ( txtfilter_processing )
          {
            break paginationCycle;
          }
          else
          {
            if ( typeof taskObjects[ ti ][ 'result' ] == 'undefined' )
            {
              taskObjects[ ti ][ 'result' ] = {
                found: false,
                wrong_urls: wrongUrls,
                txtfilter: -1
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
        }

        position *= 1;

        if ( searchResults[ position ]['page_url'] === null )
        {
          continue;
        }

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
            if ( txtfilter_processing )
            {
              break paginationCycle;
            }
            else
            {
              continue tasksCycle;
            }
          }
        }
        else if ( typeof _post[ 'get_all_urls' ] != 'undefined' )
        {
          _urllist[ taskObjects[ti]['keyword'] ].push( searchResults[ position ]['page_url'] );
        }


        if ( typeof taskObjects[ ti ][ 'result' ] == 'undefined' )
        {
          urllist[ prevPageResultsNumber + position ] = searchResults[ position ]['page_url'];

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
              foundPosition = prevPageResultsNumber + position;
              foundURL = seoa.urlToCompare( searchResults[ position ][ 'page_url' ] );

              taskObjects[ti]['result'] = {
                found : foundPosition,
                found_url: searchResults[ position ][ 'page_url' ],
                wrong_urls : {},
                txtfilter : -1
              }

              taskObjects[ ti ][ 'parsing_stats' ] = {
                'handler' : 'browser',
                'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
                'captcha_stats' : captchaSolver.stats,
                'pages' : page_number
              };


              if ( typeof _post[ 'get_all_urls' ] == 'undefined'
                    && ( typeof siteOptions[ 'competitors' ] == 'undefined' || Object.keys( siteOptions[ 'competitors' ] ).length < 1 ) )
              {
                if ( txtfilter_processing )
                {
                  break paginationCycle;
                }
                else
                {
                  continue tasksCycle;
                }
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
            foundPosition = prevPageResultsNumber + position;
            foundURL = seoa.urlToCompare( searchResults[ position ][ 'page_url' ] );

            taskObjects[ti]['result'] = {
              found: foundPosition,
              found_url: searchResults[ position ][ 'page_url' ],
              wrong_urls: {},
              txtfilter: -1
            }

            taskObjects[ti]['result']['wrong_urls'][ searchResults[ position ]['page_url'] ] = foundPosition;


            taskObjects[ ti ][ 'parsing_stats' ] = {
              'handler' : 'browser',
              'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
              'captcha_stats' : captchaSolver.stats,
              'pages' : page_number
            };


            if ( typeof _post[ 'get_all_urls' ] == 'undefined'
                  && ( typeof siteOptions[ 'competitors' ] == 'undefined' || Object.keys( siteOptions[ 'competitors' ] ).length < 1 ) )
            {
              if ( txtfilter_processing )
              {
                break paginationCycle;
              }
              else
              {
                continue tasksCycle;
              }
            }
          }
        }
      }


      prevPageResultsNumber += Object.keys( searchResults ).length;

//console.log( prevPageResultsNumber ); console.log( Object.keys( searchResults ).length );
/*
console.log( await page.url() );
console.log( resultsNumber );
console.log( '\n' );
*/


      if ( typeof searchResults[ -1 ] != 'undefined' )
      {
        break;
      }
      else if ( resultsNumber < yandex.searchDepth * 0.91 )
      {
        /**
         * Определение следующей страницы поиска
         */
        var nextPage = await yandex.nextPage( resultsNumber );

//console.log( "\n" ); console.log( '------------------' + nextPage ); console.log( "\n" );

//console.log( nextPage );

        if ( nextPage )
        {
          if ( nextPage == 'stop' )
          {
            taskObjects[ ti ][ 'parsing_stats' ] = {
              'handler' : 'browser',
              'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
              'captcha_stats' : captchaSolver.stats,
              'pages' : page_number
            };

            if ( php.trim( await page.content() ) == '<html><head></head><body></body></html>' )
            {
              break;
            }

            if ( typeof taskObjects[ ti ][ 'result' ] != 'undefined' )
            {
              delete taskObjects[ ti ][ 'result' ];
            }

            //console.log( captchaSolver.stats );
            return taskObjects;
          }
          else if ( nextPage != 'ajax' )
          {
            await seoa.pageLoad( nextPage, yandex.waitSelector );
          }

//await page.waitForTimeout( 15 * 1000 );
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
        wrong_urls: wrongUrls,
        txtfilter: -1
      };
    }


    /**
     * Поиск текстового фильтра
     */
    if ( txtfilter_processing && resultsNumber > 0 && Object.keys( urllist ).length > 0 )
    {
      var filterData = {};
      var controlURL = {};

      if ( !foundPosition )
      {
        foundPosition = resultsNumber + 1;
      }

      /**
       * Не проверять текстовый фильтр, если позиция страницы меньше равно 10
       */
      if ( foundPosition <= 10 )
      {
        filter = 0;
        taskObjects[ti]['result'][ 'txtfilter' ] = 0;
      }
      else
      {
        /**
         * Построение списка сайтов для проверки
         */
        for ( var i = foundPosition - 1; i > 0 && Object.keys( controlURL ).length < _post['sites_for_txtfilter']; i-- )
        {
          if ( typeof urllist[i] !== 'undefined' && urllist[i] !== null )
          {
            var domain = seoa.siteDomain( urllist[i] ).toLowerCase();
            controlURL[ domain ] = seoa.urlToCompare( urllist[i] );
          }
        }

        taskObjects[ti]['result'][ 'urls_for_txtfilter' ] = controlURL;
        taskObjects[ti]['result'][ 'found_url' ] = foundURL;

        /**
         * Проверка текстового фильтра через браузер была отключена,
         * из-за большого количества капч
         */
/*
        /**
         * Формирование стратового запроса для проверки
         * /
        var startQuery = taskObjects[ti]['keyword'] + ' (site:' + _post['site'];
        if ( /^[^.]+\.[^.]+$/.test( _post['site'] ) )
        {
          startQuery += ' | site:www.' + _post['site'];
        }

        for ( var controlSite in controlURL )
        {
          /**
           * Настройка переменных
           * /
          filterData[ controlSite ] = { '0': -1, '1': -1 };
          yandex.lastSearchPage = false;
          var resultsNumber = 0;
          var prevPageResultsNumber = 0;

          /**
           * Формирование окончательного запроса для проверки
           * /
          var query = startQuery + ' | site:' + controlSite;
          if ( /^[^.]+\.[^.]+$/.test( controlSite ) )
          {
            query += ' | site:www.' + controlSite;
          }
          query += ')';

          /**
           * Обрабатывать страницы пагинации в поиске,
           * пока количество результатов не будет больше чем 90% от значения глубины поиска
           * /
          paginationCycle:
          while ( resultsNumber < yandex.searchDepth * 0.91 )
          {
            /**
             * Задержка запроса
             * /
            //await page.waitForTimeout( 15 * 1000 );
            await seoa.changeProxy();

            /**
             * Результаты поиска
             * /
            var searchResults = await yandex.getSearchResults( query );

            /**
             * Прерывание задания в случае ошибки или большого количества капч
             * /
            if ( searchResults == 'stop' )
            {
              if ( typeof taskObjects[ ti ][ 'result' ] != 'undefined' )
              {
                delete taskObjects[ ti ][ 'result' ];
              }

              //console.log( captchaSolver.stats );
              return taskObjects;
            }

            /**
             * Переход к следующему сайту в случае отсутствия результатов
             * /
            if ( searchResults == false )
            {
              break;
            }

            /**
             * Задержка запроса
             * /
            if ( !seoa.proxy_changed  )
            {
              //await seoa.delay( 'yandex', query );
              await page.waitForTimeout( 20 * 1000 ); //если делать задержку меньше, будет много капчи
            }

           /**
             * Формирование данных о позициях проверяемого сайта
             * и сайта из результатов поиска
             * /
            for ( var position in searchResults )
            {
              resultsNumber ++;

              if ( resultsNumber > yandex.searchDepth )
              {
                break paginationCycle;
              }

              position *= 1;

              var url = seoa.urlToCompare( searchResults[ position ]['page_url'] );
              var domain = seoa.siteDomain( searchResults[ position ]['page_url'] ).toLowerCase();

              if ( domain == _post['site'] )
              {
                if ( filterData[ controlSite ][ 0 ] < 0 )
                {
                  if ( php.trim( foundURL ) && (
                      taskObjects[ti]['page_uri'].indexOf( '/' ) > -1
                        ||
                      /^(https?:)?(\/\/)?[^\/?#]+[\/?#]/.test( taskObjects[ti]['page_uri'] )
                    )
                  )
                  {
                    if ( foundURL == url )
                    {
                      filterData[ controlSite ][ 0 ] = prevPageResultsNumber + position;
                      break paginationCycle;
                    }
                  }
                  else if ( _post['site'] == domain && filterData[ controlSite ][ 0 ] < 0 )
                  {
                    filterData[ controlSite ][ 0 ] = prevPageResultsNumber + position;
                    break paginationCycle;
                  }
                }
              }
              else if ( taskObjects[ti]['page_uri'].indexOf( '/' ) > -1
                      || /^(https?:)?(\/\/)?[^\/?#]+[\/?#]/.test( taskObjects[ti]['page_uri'] ) )
              {
                if ( controlURL[ controlSite ] == url && filterData[ controlSite ][ 1 ] < 0 )
                {
                  filterData[ controlSite ][ 1 ] = prevPageResultsNumber + position;
                  break paginationCycle;
                }
              }
              else if ( controlSite == domain && filterData[ controlSite ][ 1 ] < 0 )
              {
                filterData[ controlSite ][ 1 ] = prevPageResultsNumber + position;
                break paginationCycle;
              }

              if ( filterData[ controlSite ][ 0 ] > -1 && filterData[ controlSite ][ 1 ] > -1 )
              {
                break paginationCycle;
              }
            }

            prevPageResultsNumber += Object.keys( searchResults ).length;

            /**
             * Определение следующей страницы поиска
             * /
            var nextPage = await yandex.nextPage( resultsNumber );
            if ( nextPage )
            {
              if ( nextPage != 'ajax' )
              {
                await seoa.pageLoad( nextPage, yandex.waitSelector );
              }
              else if ( nextPage == 'stop' )
              {
                if ( typeof taskObjects[ ti ][ 'result' ] != 'undefined' )
                {
                  delete taskObjects[ ti ][ 'result' ];
                }

                //console.log( captchaSolver.stats );
                return taskObjects;
              }
            }
            else
            {
              break;
            }
          }
*/
        }

        /**
         * Проверка текстового фильтра через браузер была отключена,
         * из-за большого количества капч
         */

        /**
         * Расчет текстового фильтра
         * /
        filter = 0;
        for ( var domain in filterData )
        {
          if ( filterData[ domain ][ 0 ] > -1 && filterData[ domain ][ 1 ] > -1 )
          {
            if ( filterData[ domain ][ 1 ] > filterData[ domain ][ 0 ] )
            {
              filter += 1;
            }
          }
          else if ( filterData[ domain ][ 0 ] > -1 )
          {
            filter += 1;
          }
        }
      }

      /**
       * Текстовый фильтр в процентах
       * /
      taskObjects[ti]['result'][ 'txtfilter' ] = Math.ceil( 100 * filter / _post['sites_for_txtfilter'] );
      */
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

  //console.log( captchaSolver.stats );
  return taskObjects;
}

module.exports = keywordsPositionYandex;
