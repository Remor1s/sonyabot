/**
 * Обработка заданий в nodejs
 *
 * @package SerpHunt
 * @subpackage Core
 *
 * cls && cls && "C:\Program Files\nodejs\node.exe" "D:\OpenServer\domains\serphunt\admin\nodejs\test-js\snippets.js"
 *
 * clear && clear && /opt/node-v8.8.1-linux-x64/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/snippets.js
 * clear && clear &&  /opt/node-v12.14.0-linux-x64/bin/node /home/admin/web/default/public_html/nodejs//test-js/snippets.js
 *
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/snippets.js
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/default/public_html/nodejs/test-js/snippets.js
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



const search_engine = 'google';
//const search_engine = 'yandex';

const keywordlist = [
  //'проверить позиции сайта site:serphunt.ru',
  //'проверка позиций сайта онлайн'
  //'купить окна'
  //'двери'
  'букмекерские конторы'
];


const device = 'desktop';

const language = 'ru'; //ky
const country = 'RU'; //KG
const sedomain = '.ru';


if ( search_engine == 'yandex' )
{
  var region = 142;
}
else
{
  //Москва
  var region = 1011969;

  //Владивосток
  //var region = 1012008;

  //Липецк
  //var region = 1011947;

  //Ярославль
  //var region = 1012084;




  let google_regions = {
    1011969 : {
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


    1012008 : {
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


    1011947 : {
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


    1012084 : {
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
  };

  var region = google_regions[ region ];
}


_post = {
  'handler' : 'snippets-' + search_engine,
  'query_key' : 'x',
  'keywordlist' : keywordlist,
  'region' : region,
  'device' : device,
  'number_of_results' : 100,

  'proxy' : {
    'proxy_key' : '85a0a8c85a44a97bdbbbf2843841a392',
    'ip' : '95.217.104.56',
    'port' : '33149',
    'ipv6' : '0',
    'type' : 'http',
    'userpwd' : 'F3Wkq3iFbgHl:bUifLgN5JK',
    'service' : 'yandex',
  },

  'task_id' : 1,
  'thread_id' : 1
};



var profilekey = 'snippets';

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


    /**
     * Авторизация прокси
     */
    await seoa.proxyAuth();


    /**
     * Контроль загрузки файлов
     */
    await seoa.setRequestInterception();


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


    output = await seoa.handler( _post.handler );


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

