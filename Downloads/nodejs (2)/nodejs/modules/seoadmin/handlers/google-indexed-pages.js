/**
 * Количество проидексированных в Google страниц
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function googleIindexedPages()
{
  let output = {};


  if ( typeof _post[ 'sitelist' ] == 'object' )
  {
    var sites_number = Object.keys( _post['sitelist'] ).length;
  }
  else
  {
    var sites_number = _post[ 'sitelist' ].length;
  }

  for ( let i = 0; i < sites_number; i++ )
  {
    const site = _post[ 'sitelist' ][ i ];
    if ( await google.setSearchURL( 'site:' + site ) != 'stop' )
    {
      let results_number = await page.evaluate( () => {
        let $result_stats = document.getElementById( 'result-stats' );

        if ( $result_stats != null )
        {
          return $result_stats.innerHTML + '';
        }
        else
        {
          return 'selector not found';
        }
      });

      if ( results_number == 'selector not found' )
      {
        output[ site ] = 0
      }
      else
      {
        results_number = results_number.replace( /<[^>]+>[^<]+<[^>]+>/g, '' );
        results_number = results_number.replace( /\D+/g, '' );
        output[ site ] = results_number * 1;
      }
    }
  }

  return output;
}

module.exports = googleIindexedPages;
