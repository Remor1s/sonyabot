/**
 * Индексация в Google
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function indexingGoogle()
{
  /**
   * Настройка переменных
   */
  let urls = [];
  let checkPageList = {};

  let output = {
    'parsing_stats' : [],
    'captcha_stats' : []
  };

  captchaSolver.stats = [];
  google.resultsPerPage = 10;


  if ( typeof _post['pagelist'] == 'object' )
  {
    var pages_number = Object.keys( _post['pagelist'] ).length;
  }
  else
  {
    var pages_number = _post['pagelist'].length;
  }

  for ( var i = 0; i < pages_number; i++ )
  {
    google.lastSearchPage = false;
    var checkURL = _post['pagelist'][i];

    let start_time = new Date().getTime();
    let captchas_number = captchaSolver.stats.length;


    querySteps:
    for ( var step = 1; step <= 2; step ++ )
    {
      /**
       * Настройка запроса
       */
      if ( step == 1 )
      {
        if ( _post['pagelist'][i].indexOf( 'https' ) > -1 )
        {
          var query = 'site:' + _post['pagelist'][i];
        }
        else
        {
          var query = 'site:' + _post['pagelist'][i].replace( /(https?:)?\/\/(www\.)?/, '' );
        }
      }
      else
      {
        //var query = _post['pagelist'][i].replace( /(https?:)?\/\/(www\.)?/, '' );
        var query = _post['pagelist'][i];
      }


      /**
       * Список результатов поиска
       */
      var searchResults = await google.getSearchResults( query, false );

      /**
       * Прерывание задания в случае большого количества капч
       */
      if ( searchResults == 'stop' )
      {
        return output;
      }

      /**
       * Переход к следующему объекту задания в случае отсутствия результатов
       */
      if ( searchResults == false )
      {
        continue;
      }

      /**
       * Данные о индексации по умолчанию
       */
      output[ checkURL ] = {
        google_index: 0,
        google_cache: '1970-01-01 00:00:01'
      };

      /**
       * Обработка результатов поска
       */
      for ( var position in searchResults )
      {
        result = seoa.checkUrlMatching(
          checkURL,
          searchResults[ position ]['page_url']
        );

        if ( result.found )
        {
          output[ checkURL ][ 'google_index' ] = 1;

          /**
           * Получение информации о кэше Google
           */
          //if ( _post['pagelist'][ i ].indexOf( 'https' ) < 0 && searchResults[ position ][ 'cache_url' ] && typeof _post[ 'without_cache_date' ] == 'undefined' )
          if ( searchResults[ position ][ 'cache_url' ] && typeof _post[ 'without_cache_date' ] == 'undefined' )
          {
            await seoa.pageLoad( searchResults[ position ]['cache_url'], 'div' );

            output[ checkURL ][ 'google_cache' ] = await page.evaluate( () => {
              $divlist = document.body.getElementsByTagName( 'div' );
              for ( var i = 0; i < $divlist.length; i ++ )
              {
                if ( $divlist[i].id.indexOf( 'google-cache-hdr' ) > -1 )
                {
                  /**
                   * Дополняет строку другой строкой до заданной длины
                   *
                   * @param string input Входная строка
                   * @param string padLength Длина дополнения
                   * @param string padString Добавляемая строка
                   * @param string padType Опционально. Сторона с которой происходит добавление: STR_PAD_RIGHT, STR_PAD_LEFT или STR_PAD_BOTH
                   *
                   * @return string
                   */
                  function seoaStrPad( input, padLength, padString, padType )
                  {
                    var half = ''
                    var padToGo = 0;

                    var _strPadRepeater = function (s, len)
                    {
                      var collect = '';
                      while ( collect.length < len )
                      {
                        collect += s;
                      }

                      collect = collect.substr(0, len);
                      return collect;
                    }

                    input += '';
                    padString = padString !== undefined ? padString : ' ';

                    if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !== 'STR_PAD_BOTH')
                    {
                      padType = 'STR_PAD_RIGHT';
                    }

                    if ( ( padToGo = padLength - input.length ) > 0 )
                    {
                      if (padType === 'STR_PAD_LEFT')
                      {
                        input = _strPadRepeater(padString, padToGo) + input;
                      }
                      else if (padType === 'STR_PAD_RIGHT')
                      {
                        input = input + _strPadRepeater( padString, padToGo );
                      }
                      else if (padType === 'STR_PAD_BOTH')
                      {
                        half = _strPadRepeater( padString, Math.ceil( padToGo / 2 ) );
                        input = half + input + half;
                        input = input.substr( 0, padLength );
                      }
                    }
                    return input;
                  }


                  cacheMatches = /(\d+ (\D+) \d+ \d+:\d+:\d+)( GMT\.?)?/.exec( $divlist[i].innerHTML );
                  if ( cacheMatches !== null )
                  {
                    cacheDate = cacheMatches[1];


                    if ( ( day_matches = /^(\d{1})\s+/.exec( cacheDate ) ) != null )
                    {
                      cacheDate = cacheDate.replace(
                        /^(\d{1})\s+/,
                        seoaStrPad( day_matches[1], 2, '0', 'STR_PAD_LEFT' ) + ' '
                      );
                    }

                    monthListAll = [
                      [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ],
                      [ 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ],
                      [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
                      [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
                    ];

                    monthTopCycle:
                    for ( var mai = 0; mai < monthListAll.length; mai ++ )
                    {
                      for ( var mi = 0; mi < monthListAll[ mai ].length; mi ++ )
                      {
                        var monthRegexp = new RegExp( monthListAll[ mai ][ mi ], 'i' );
                        if ( monthRegexp.test( cacheDate ) )
                        {
                          cacheDate = cacheDate.replace(
                            monthRegexp,
                            seoaStrPad( mi + 1, 2, '0', 'STR_PAD_LEFT' )
                          );

                          break monthTopCycle;
                        }
                      }
                    }

                    cacheDate = cacheDate.replace( /^(\d+)\s+(\d+)\s+(\d+)/, '$3-$2-$1' );


                    return cacheDate;
                  }
                  else
                  {
                    return '1970-01-01 00:00:01';
                  }
                }
              }

              return '1970-01-01 00:00:01';
            });
          }

          break querySteps;
        }
      }
    }


    output[ 'parsing_stats' ].push( {
      'search_engine' : 'google',
      'task_action' : 'indexing',
      'handler' : 'browser',
      'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
      'captchas' : captchaSolver.stats.length - captchas_number,
      'pages' : step
    } );
  }

  return output;
}

module.exports = indexingGoogle;
