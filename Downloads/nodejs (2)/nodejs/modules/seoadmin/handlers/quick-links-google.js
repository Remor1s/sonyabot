/**
 * Быстрые ссылки в Google
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function quickLinksGoogle()
{
  /**
   * Настройка переменных
   */
  var output = {};
  siteOptions = {
    quicklinks : true
  }

  google.resultsPerPage = 10;

  if ( typeof _post[ 'domains' ] == 'object' )
  {
    var domains_number = Object.keys( _post[ 'domains' ] ).length;
  }
  else
  {
    var domains_number = _post[ 'domains' ].length;
  }

  //for ( var i = 0; i < domains_number; i++ )
  for ( var domain in _post[ 'domains' ] )
  {
    google.lastSearchPage = false;

    siteOptions[ 'domain' ] = php.pregQuote( domain, '/');
    siteOptions[ 'domain_idn' ] = php.pregQuote( _post[ 'domains' ][ domain ], '/');


    /**
     * Список результатов поиска
     */
    var searchResults = await google.getSearchResults( domain, false );

//console.log( searchResults );

    /**
     * Прерывание задания в случае большого количества капч
     */
    if ( searchResults == 'stop' )
    {
      return output;
    }


    output[ domain ] = 0;


    /**
     * Переход к следующему объекту задания в случае отсутствия результатов
     */
    if ( searchResults == false )
    {
      continue;
    }


    /**
     * Обработка результатов поска
     */
    for ( var position in searchResults )
    {
      if ( typeof searchResults[ position ][ 'linklist' ] == 'undefined' )
      {
        searchResults[ position ][ 'linklist' ] = [];
      }

      if ( searchResults[ position ][ 'linklist' ].length > 0 )
      {
        output[ domain ] = searchResults[ position ][ 'linklist' ].length;
        break;
      }
    }
  }

  return output;
}

module.exports = quickLinksGoogle;
