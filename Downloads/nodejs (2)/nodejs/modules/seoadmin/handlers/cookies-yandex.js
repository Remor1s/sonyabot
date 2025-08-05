/**
 * Проверка частотности ключевых слов
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function cookiesYandex()
{
  const auth_status = await yandex.auth( 'https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast', true );

  if ( auth_status === true )
  {
    const pagelist = {
      'passport' : 'https://passport.yandex.ru',
      'direct' : 'https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast',
      //'wordstat' : 'https://wordstat.yandex.ru'
    }

    for ( let pk in pagelist )
    {
/*
      if ( pk == 'wordstat' )
      {
        await seoa.pageLoad( pagelist[ pk ], 'div' );
      }
*/

//console.log( k );

      let cookies_str = [];
      let cookies = await page.cookies( pagelist[ pk ] );

      for ( let pi in cookies )
      {
        cookies_str.push( cookies[ pi ][ 'name' ] + '=' + cookies[ pi ][ 'value' ] );
      }

      if ( cookies_str.length > 0 )
      {
        fs.writeFileSync( _post[ 'cookies_dir' ] + '/' + pk, cookies_str.join( ';' ) );
      }

      //console.log( this.cookies );
    }

    return { 'auth_status' : 1 };
  }
  else
  {
    return { 'auth_status' : 0 };
  }
}

module.exports = cookiesYandex;
