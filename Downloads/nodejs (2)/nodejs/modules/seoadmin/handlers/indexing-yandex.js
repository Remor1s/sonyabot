/**
 * Индексация в Google
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function indexingYandex()
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
    /**
     * Подготовка группы запросов для проверки
     */
    var checkURL_1 = _post['pagelist'][i].replace( /^(https?:)?\/\/(www\.)?/, '' ).toLowerCase();
    var checkURL_2 = 'www.' + checkURL_1;

    var checkURL = checkURL_1;
    checkURL = checkURL.replace( '/www.', '/' );
    if ( /^[^\/]+\/$/.test( checkURL ) )
    {
      checkURL = checkURL.replace(/\/$/, '');
    }
    checkPageList[ checkURL ] = _post['pagelist'][i];

    urls.push( checkURL_1, checkURL_2 );

    var query = '(url:' + urls.join( ') | (url:' ) + ')';

    if ( _post['pagelist'][ i + 1 ] != undefined )
    {
      var nextQuery = query + _post['pagelist'][ i + 1 ] + _post['pagelist'][ i + 1 ];

      if ( nextQuery.length > 380 )
      {
        var query_length = 400;
      }
      else
      {
        var query_length = query.length;
      }
    }
    else
    {
      var query_length = query.length;
    }

    /**
     * Начало проверки, если длина запроса больше 350
     * или номер проверяемого URL последний в списке
     */
    if ( query_length >= 250 || i == pages_number - 1 )
    {
      yandex.lastSearchPage = false;
      let start_time = new Date().getTime();
      let captchas_number = captchaSolver.stats.length;
      let searchResults = await yandex.getSearchResults( query, false );

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
//fs.writeFileSync( rootPath + '/_test/' + checkURL.replace( /[ {}.:\/|?&\\]/g, '_' ) + '.html', await page.content() );
      for ( var checkURL in checkPageList )
      {
        /**
         * Данные о индексации по умолчанию
         */
        output[ checkPageList[ checkURL ] ] = {
          yandex_index: 0,
          yandex_cache: '1970-01-01 00:00:01'
        };

        for ( var position in searchResults )
        {
          result = seoa.checkUrlMatching(
            checkURL,
            searchResults[ position ]['page_url']
          );

          if ( result.found )
          {
            output[ checkPageList[ checkURL ] ][ 'yandex_index' ] = 1;

            /**
             * Получение информации о кэше Яндекс
             */
            if ( searchResults[ position ]['cache_url'] && _post['without_cache_date'] == undefined )
            {
              await seoa.pageLoad( searchResults[ position ]['cache_url'], 'head' );

              output[ checkPageList[ checkURL ] ][ 'yandex_cache' ] = await page.evaluate( () => {
                var headhtml = document.querySelector( 'head' ).innerHTML;
                var cache = /window\.YaCC\s*=\s*\{\}\)\)\.date\s*=\s*\'([^\']+)\';/i.exec( headhtml );
                if ( cache != null )
                {
                  cache = cache[1].replace( /(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1' );
                  return cache.replace( /\[|\]/g, '' );
                }
                else
                {
                  return '1970-01-01 00:00:01';
                }
              });
            }

            break;
          }
        }
      }


      output[ 'parsing_stats' ].push( {
        'search_engine' : 'yandex',
        'task_action' : 'indexing',
        'handler' : 'browser',
        'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
        'captchas' : captchaSolver.stats.length - captchas_number,
        'pages' : 1
      } );

      urls = [];
      checkPageList = {};
    }
  }


  output[ 'captcha_stats' ] = captchaSolver.stats;

  return output;
}

module.exports = indexingYandex;
