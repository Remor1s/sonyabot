/**
 * Обработка заданий в nodejs
 *
 * @package SerpHunt
 * @subpackage Core
 *
 * cls && cls && "C:\Program Files\nodejs\node.exe" "D:\OpenServer\domains\serphunt\admin\nodejs\test-js\positions.js"
 *
 * clear && clear && /opt/node-v8.8.1-linux-x64/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/positions.js
 * clear && clear &&  /opt/node-v12.14.0-linux-x64/bin/node /home/admin/web/default/public_html/nodejs//test-js/positions.js
 *
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/positions.js
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/default/public_html/nodejs/test-js/positions.js
 */



/**
 * Подключение библиотек
 */
const yandexClass = require( '../modules/yandex/yandex.js' );
const googleClass = require( '../modules/google/google.js' );
const captchaSolverClass = require( '../modules/captcha-solver/captcha-solver.js' );
const mysql = require( 'mysql2' ); //проблемы с сериализацией

querystring = require( 'querystring' );
request = require( 'request-promise-native' );
md5 = require( 'crypto-js/md5' );
fs = require( 'fs' );
path = require( 'path' );
fileExists = require( 'file-exists' );
isJSON = require( 'is-json' );
php = require( '../modules/php/php.js' );
seoaClass = require( '../modules/seoadmin/seoadmin.js' );


//const puppeteer = require( 'puppeteer-core');
puppeteer = require( 'puppeteer-extra' );

const StealthPlugin = require( 'puppeteer-extra-plugin-stealth' );
puppeteer.use( StealthPlugin() );


/**
 * Настройка переменных
 */
browser = null;
page = null;
_get = null;
_post = null;
seoaOptions = null;
pool = null;
promisePool = null;
yandexCaptcha = null;
//taskObjects = {};
captchaNumbers = {
  authorization: 0,
  parsing: 0
};

rootPath = __dirname.replace(/[\\\/]+nodejs(-new)?[\\\/]test-js$/, '');

if ( __dirname.indexOf( '.serphunt.ru' ) < 0 )
{
  seoa_test = true;
}



const device = 'desktop';
//const device = 'mobile';

let language = 'ru'; //ky
let country = 'RU'; //KG
let sedomain = '.ru';

//const yandex_region_id = '142';
const yandex_region_id = '193'; //Воронеж
const yandex_region_desktop = yandex_region_id + '_desktop_' + language;
const yandex_region_mobile = yandex_region_id + '_mobile_' + language;
//const region = yandex_region_id + '_' + device + '_' + language;


//Москва
//const region = '1011969_' + device + '_ru';
//const region = '_' + device + '_ru';

//Владивосток
//const region = '1012008_' + device + '_ru';

//Липецк
//const region = '1011947_' + device + '_ru';

//Ярославль
const region = '1012084_' + device + '_ru';


//Азербайджан
//const region = '2031_' + device + '_az';
//language = 'az'; //ky
//country = 'AZ'; //KG
//sedomain = '.az';



//const site = 'https://serphunt1.ru/positions/';
//const site = 'lipetsk.tmk-okna.ru';
const site = 'xn--b1aaecdcs6bhr1d4d.xn--p1ai'; //дверивходные.рф
//const site = 'sportvital.ru';


const keywordlist = [
  //'проверить позиции сайта site:serphunt.ru',
  //'проверка позиций сайта онлайн'
  //'купить окна'
  //'двери'
  'pəncərə təmizləyən'
  //'купить эллиптический тренажер воронеж',
];




/*
  txtfilter: '0',
  region_id: '207',
  domain: sedomain,
  country_code: country,
  latitude: '0.0000000',
  longitude: '0.0000000',
  device: 'mobile',
  language: language,
  cron: { period: '86400', hour: '0' },
  search_depth: '100'
*/

siteOptions = {
  'site_url' : site,
  'positions_with_subdomains' : 0,
   'yandex' : {
      'position_regions' : {
        [ yandex_region_desktop ] : {
          'txtfilter' : '0',
          'region_id' : yandex_region_id,
          'domain' : sedomain,
          'country_code' : country,
          'device' : 'desktop',
          'language' : language,
          'search_depth' : '100'
        },
        [ yandex_region_mobile ] : {
          'txtfilter' : '0',
          'region_id' : yandex_region_id,
          'domain' : sedomain,
          'country_code' : country,
          'device' : 'mobile',
          'language' : language,
          'search_depth' : '100'
        },
/*
        [ yandex_region_desktop ] : {
          'txtfilter' : '0',
          'region_id' : yandex_region_id,
          'domain' : sedomain,
          'country_code' : country,
          'device' : 'desktop',
          'language' : language,
          'search_depth' : '100'
        },
        [ yandex_region_mobile ] : {
          'txtfilter' : '0',
          'region_id' : yandex_region_id,
          'domain' : sedomain,
          'country_code' : country,
          'device' : 'mobile',
          'language' : language,
          'search_depth' : '100'
        },
*/
      }
   },
  'google' : {
    'position_regions' : {

      '_desktop_ru' : {
        'region_id' : 0,
        'domain' : sedomain,
        'country_code' : country,
        'uule' : '',
        'device' : 'desktop',
        'language' : language,
        'search_depth' : '100'
      },

      '1011969_desktop_ru' : {
        'region_id' : '1011969',
        'domain' : sedomain,
        'country_code' : country,
        'uule' : 'UTW9zY293LE1vc2NvdyxSdXNzaWE',
        'latitude' : '55.7558260',
        'longitude' : '37.6173000',
        'device' : 'desktop',
        'language' : language,
        'search_depth' : '100'
      },


      '1012008_desktop_ru' : {
        'region_id' : '1012008',
        'domain' : sedomain,
        'country_code' : country,
        'uule' : 'hVmxhZGl2b3N0b2ssUHJpbW9yc2t5IEtyYWksUnVzc2lh',
        'latitude' : '43.1737387',
        'longitude' : '132.0064506',
        'device' : 'desktop',
        'language' : language,
        'search_depth' : '100'
      },


      '1011947_desktop_ru' : {
        'region_id' : '1011947',
        'domain' : sedomain,
        'country_code' : country,
        'uule' : 'dTGlwZXRzayxMaXBldHNrIE9ibGFzdCxSdXNzaWE',
        'latitude' : '52.6121996',
        'longitude' : '39.5981225',
        'device' : 'desktop',
        'language' : language,
        'search_depth' : '100'
      },


      '1012084_desktop_ru' : {
        'region_id' : '1012084',
        'domain' : sedomain,
        'country_code' : country,
        'uule' : 'hWWFyb3NsYXZsLFlhcm9zbGF2bCBPYmxhc3QsUnVzc2lh',
        'latitude' : '52.57.6260744',
        'longitude' : '39.8844708',
        'device' : 'desktop',
        'language' : language,
        'search_depth' : '100'
      },


      '2031_desktop_az' : {
        'region_id' : '1012084',
        'domain' : sedomain,
        'country_code' : country,
        'uule' : 'KQXplcmJhaWphbg',
        'latitude' : '40.1431050',
        'longitude' : '47.5769270',
        'device' : 'desktop',
        'language' : language,
        'search_depth' : '100'
      },
    }
  }
};


for ( let k_desktop in siteOptions[ 'google' ][ 'position_regions' ] )
{
  const k_mobile = k_desktop.replace( 'desktop', 'mobile' );

  siteOptions[ 'google' ][ 'position_regions' ][ k_mobile ] = siteOptions[ 'google' ][ 'position_regions' ][ k_desktop ];
}


let task_objects = [];
for ( let k in keywordlist )
{
  task_objects.push(
    {
      'page_uri' : site,
      'keyword' : keywordlist[ k ],
      'device' : device,
      'region' : region,
      'incomplete_match_uri' : 0,
    }
  );
}


_post = {
  //'handler' : 'keywords-position-google',
  'handler' : 'keywords-position-yandex',

  'site' : site,
  'txtfilter' : 0,
  'sites_for_txtfilter' : 5,
  'captcha_numbers' : 0,

  'task_objects' : task_objects,

  'device' : device,

  'proxy' : {
    'proxy_key' : '85a0a8c85a44a97bdbbbf2843841a392',
    'ip' : '91.243.188.184',
    'port' : '7951',
    'ipv6' : '0',
    'type' : 'http',
    'userpwd' : 'irp1040922:DPgtEfj8jp',
    'service' : 'yandex',
  },

/*
  'account' : {
    'account_key' : '2fffdd2e21b2f78b97b18012fc366449',
    'user' : 'creeppopalsu1984@yandex.ru',
    'password' : 'qie0uUbcSB',
    'phone' : '',
    'control_answer' : '79500429076'
  },
*/

  'task_id' : 1,
  'thread_id' : 1
};



if ( _post.handler.indexOf( 'yandex' ) )
{
  var profilekey = md5( _post[ 'proxy' ][ 'proxy_key' ] + 'yandex' );
}
else
{
  var profilekey = md5( _post[ 'proxy' ][ 'proxy_key' ] + 'google' );
}

//var profilekey = 'bad';
var profilekey = 'test-frequency';

console.log( '\nprofile: ' + profilekey + '\n' );

if ( __dirname.indexOf( 'admserv.serphunt.ru' ) > -1 )
{
  serverName = 'admserv.serphunt.ru';
  _post[ 'profile_path' ] = '/tmp/puppeteer-serphunt-test/' + profilekey + '/';
}
else if ( __dirname.indexOf( '/web/default/' ) > -1 )
{
  serverName = 'tasks.serphunt.ru';
  _post[ 'profile_path' ] = '/tmp/puppeteer-serphunt-test/' + profilekey + '/';
}
else
{
  serverName = 'admin.serphunt';
  _post[ 'profile_path' ] = 'D:/OpenServer/userdata/temp/puppeteer-serphunt-test/' + profilekey + '/';
}



/**
 * Загрузка настроек sephunt
 */
var optionsFile = rootPath + '/storage/' + serverName + '/options.php';
seoaOptions = fs.readFileSync( optionsFile ).toString().replace( '<?php exit; ?>', '' );
seoaOptions = php.unserialize( seoaOptions );

if ( siteOptions != undefined && typeof siteOptions[ 'positions_with_subdomains' ] == 'undefined' )
{
  siteOptions[ 'positions_with_subdomains' ] = false;
}


/*
page_content = fs.readFileSync( rootPath + '/_errors/page.html' ).toString();
let rnd = /[&;]rnd=([^ &"\']+)/.exec( page_content );
//let msid = /[&;]msid=([^ &"\']+)/.exec( page_content );
let reqid = /"reqid":"([^"]+)"/.exec( page_content );

console.log(  rnd[ 1 ] );
//console.log(  msid[ 1 ] );
console.log(  reqid[ 1 ] );
return;
*/

/**
 * Создание экземпляров необходимых классов
 */
seoa = new seoaClass();
yandex = new yandexClass();
google = new googleClass();
captchaSolver = new captchaSolverClass();


//puppeteer.launch( seoa.puppeteerOptions() ).then( async browser => {
(async () => {
  try
  {
/*
//console.log( Buffer.from('dXNlcm5hbWU6cGFzc3dvcmQ=', 'base64').toString('utf8') );
/*
let imagex = fs.readFileSync( 'D:/_captcha.png', 'ascii' );
//console.log( imagex );
imagex = Buffer.from( imagex, 'base64' );
//.toString('ascii' );
//imagex = imagex.toString( 'ascii' );
//console.log( imagex.toString('utf-8') );
fs.writeFileSync( 'D:/captcha.png', imagex );
return false;
* /

const imageurl = 'https://yandex.ru/captchaimage?mt=2149316C264742F68426AFDC74AF3F0056CD7E88C81308BC78481FFC099BD57FAF81F78AD64F6DD784C2547700D444BD1EAA3D930C5215C7A017CF592D441CB0227C2131ADCEFBE2740DE8890A57378D5357A7394D09C761175568EB5AD1E78B01EE267CFADA0307266A76F93C1CC24484AE2F8096C592B7B65EFB7BA200548F052A7969D831E2F8456E940A7419791770075357DBDA648E85D173BD7727E6350EF32BD249D7DECCB0970520590CCD50754FB92A2B1E48758DF30AAEC18E1DFDB2F316B134A4660B5264A875F5DAAC00&s=f209bcb5091c782d880fd642659a28b8';
//let image = await request.get({ 'url': imageurl, 'encoding': null });
let image = await request.get({ 'url': imageurl, 'encoding': 'base64' });
/*
image = Buffer.from( image, 'base64' );
image = image.toString( 'base64' );
//image = Buffer.from( image, 'base64' );
* /
fs.writeFileSync( 'D:/_captcha.png', image );
return false;
*/


/*
    let response await request.post({
      url: 'http://admin.serphunt/test.php',
      body: JSON.stringify( data ),
      'Content-Type': 'application/json'
    });

console.log( response );

return false;
*/

    /**
     * Создание асинхронного подключения к БД
     */
    pool = await mysql.createPool({
      connectionLimit : 5,
      host     : seoaOptions['database']['host'],
      user     : seoaOptions['database']['username'],
      password : seoaOptions['database']['password'],
      database : seoaOptions['database']['name']
    });

    promisePool = await pool.promise();


    /**
     * Запуск браузера
     */
    browser = await puppeteer.launch( seoa.puppeteerOptions() );
    page = await browser.newPage();
//await seoa.xxxxx();
//await page.setJavaScriptEnabled( false );

    /**
     * Авторизация прокси
     */
    await seoa.proxyAuth();


    /**
     * Контроль загрузки файлов
     */
    await seoa.setRequestInterception();


    /**
     * Ожидание ответа сервера для объявления страницы загруженной
     * используется в seoadmin => pageLoad

    responseEventOccurred = false;
    responseHandler = ( event ) => ( responseEventOccurred = true );
    page.on( 'response', responseHandler );
     */


    /**
     * Выбор fingerprint
     */
    if ( typeof _post[ 'device' ] != 'undefined' )
    {
      await seoa.setFingerprint( _post[ 'device' ] );
    }
    else
    {
      await seoa.setFingerprint();
    }


    /**
     * Включение нотификаций
     */
    let context = browser.defaultBrowserContext();
    await context.overridePermissions( 'https://yandex.ru/search', [ 'geolocation', 'notifications' ] );
    await context.overridePermissions( 'https://www.google.com/search', [ 'geolocation', 'notifications' ] );
    await context.overridePermissions( 'https://www.google.ru/search', [ 'geolocation', 'notifications' ] );
    await context.overridePermissions( 'https://www.google.be/search', [ 'geolocation', 'notifications' ] );


    /**
     * Очистка cookies
     *
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    */


    /**
     * Подключение обработчика
     */
/*
    await page.setJavaScriptEnabled( false );

    const url = 'https://yandex.ru/showcaptcha?cc=1&mt=FDED671200FA97E7F6B6CAF777E82B1F7AE80A28690F7249EEEA4A0BD90AEC3ADBDBC890711F678BBBC2E741BE95B54E0E97F220D61CC2EA17BADFF1F937192D2518A9A9BEA20C17576A8D963728280F14BB56D99A7455199AD99EDBEBE7DAD399CE71F42753DA4D87D5C45E28A544&retpath=aHR0cHM6Ly95YW5kZXgucnUvc2VhcmNoP3RleHQ9JUQwJUIzJUQwJUI1JUQwJUJEJUQwJUI1JUQxJTgwJUQwJUIwJUQxJTgyJUQwJUJFJUQxJTgwKyVEMSU4OCVEMSU4MCVEMCVCOCVEMSU4NCVEMSU4MiVEMCVCRSVEMCVCMislRDAlQkUlRDAlQkQlRDAlQkIlRDAlQjAlRDAlQjklRDAlQkQmbHI9MjI1JnNlYXJjaF9zb3VyY2U9eWFydV9kZXNrdG9wX2NvbW1vbg%2C%2C_b1b12b7b21b1d7a245abc9140a1d80c4&t=5/1698445065/760fa618c7e1ca05ec287166455574cc&u=15d62655-ea044c3d-e4315b7d-536427cc&s=92f08090b1e8146bab1b508bfd9936c9';
    if ( await seoa.pageLoad( url, yandex.waitSelector ) )
    {
      let $captcha_slider = await page.$( '.CaptchaSlider' );
      if ( $captcha_slider )
      {
        seoa._pageContent = '';

        js_enabled = true;
        await page.setJavaScriptEnabled( true );
        await page.reload();
        await page.waitForTimeout( 1000 );

        let $captcha_slider = await page.$( '.CaptchaSlider' );
        if ( $captcha_slider )
        {
          const cached_url = await page.url();
          const slider_offset = await $captcha_slider.boundingBox();

          const start_point = {
            'x' : slider_offset[ 'x' ] + 15,
            'y' : slider_offset[ 'y' ] + 15
          };

          const end_point = {
            'x' : slider_offset[ 'x' ]  + slider_offset[ 'width' ] - 5,
            'y' : slider_offset[ 'y' ] + slider_offset[ 'height' ] - 5
          };


          await page.mouse.move( start_point[ 'x' ], start_point[ 'y' ] );
          await page.mouse.down();
          await page.waitForTimeout( 50 );
          await page.mouse.move( end_point[ 'x' ], end_point[ 'y' ] );
          await page.waitForTimeout( 50 );
          await page.mouse.up();

          try
          {
            let ci = 0;
            //while ( await page.url() == cached_url && ci <= 60 )
            while ( await page.url() == cached_url && ci <= 100 )
            {
              await page.waitForTimeout( 100 );
              ci++;
            }
          }
          catch ( error )
          {

          }


          if ( await page.url() != cached_url )
          {
            console.log( '\n\nyandex slider captcha is solved\n\n' );
          }
        }
      }
    }
*/

/*
    await page.setJavaScriptEnabled( false );

    const url = 'https://yandex.ru/showcaptcha?cc=1&mt=ABA4A47CBDCE12ED91DC9B8BEE3D548494921FAD1F81F8C7931B139CABA2EDB4AD5EFDD4EB228E9E8DAA5507259F2E7429DD91B709D97025B23ED639AE3F2158D75C350004B70598B0A53A05F438ABA4643C1347907BE6931D62D69BE41AE0C7929047A6E59BF256B4AF862A51D7E172&retpath=aHR0cHM6Ly95YW5kZXgucnUvc2VhcmNoP3RleHQ9JUQxJTg0JUQxJTgzJUQxJThEJUQxJTgyKyVEMCVCQSVEMCVCRSVEMCVCQiVEMCVCMSVEMCVCMCVEMSU4MSVEMCVCMCslRDElODYlRDAlQjUlRDAlQkQlRDAlQjAmbHI9MjEzJnA9MSZybmQ9NDEzNTEmbXNpZD0xNjk4NDgxNDM0MzM4NDY1LTU0ODA5ODcxNzU2OTE3NTExNzctYmFsYW5jZXItbDdsZXZlbGVyLWt1YnIteXAtc2FzLTcyLUJBTC04MTY%2C_ff51e9c3a57880efa236f96e392bca43&t=5/1698481437/6133773999866ef363fcbd5a25d07e09&u=9ff2548b-a29fb330-c0a91e6c-3274e00d&s=aff7c78051d2c0f3c491f3e7956becb7';
    await page.goto( url );
    await yandex.checkCaptcha();
*/

/*
    if ( await seoa.pageLoad( url, yandex.waitSelector ) )
    {
      await yandex.checkCaptcha();
    }
*/

    output = await seoa.handler( _post.handler );


    /**
     * Удаление cookies Яндекса
     *
      var cookies = await page.cookies( 'https://yandex' + this.domain );
      for ( let i = 1; i < cookies.length; i ++ )
      {
        //console.log( cookies[ i ] );
        await page.deleteCookie( cookies[ i ] );
      }
    */



    /**
     * Вывод результатов
     */
    await console.log("\n");
    await console.log( output )
    await console.log("\n");
    await console.log( '/******************** captcha numbers ********************/' );
    await console.log("\n");
    await console.log( captchaNumbers );


    if ( promisePool !== null )
    {
      await promisePool.end( this.dbErrorPorcessing );
    }

    if ( typeof seoa_test == 'undefined' )
    {
      if ( browser )
      {
        await browser.close();
      }
    }

    //await process.exit();
  }
  catch ( error )
  {
    /**
     * Обработка ошибок
     */
    console.log( '//////////////////////////////////////////' );
    console.log( error );
    console.log( '//////////////////////////////////////////' );


    if ( promisePool )
    {
      await promisePool.end( seoa.dbErrorPorcessing );
    }


    if ( typeof seoa_test == 'undefined' )
    {
      if ( browser )
      {
        await browser.close();
      }
    }

    //await process.exit();
  }
})();
//});

