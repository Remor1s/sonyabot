/**
 * Обработка заданий в nodejs
 *
 * @package SerpHunt
 * @subpackage Core
 *
 * cls && cls && "C:\Program Files\nodejs\node.exe" "D:\OpenServer\domains\serphunt\admin\nodejs\test-js\google-indexed-pages.js"
 *
 * clear && clear && /opt/node-v8.8.1-linux-x64/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/google-indexed-pages.js
 * clear && clear &&  /opt/node-v12.14.0-linux-x64/bin/node /home/admin/web/default/public_html/nodejs//test-js/google-indexed-pages.js
 *
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/google-indexed-pages.js
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/default/public_html/nodejs/test-js/google-indexed-pages.js
 */



/**
 * Подключение библиотек
 */
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


const sitelist = [
  'lipetsk.tmk-okna.ru',
  'youtube.com'
];



_post = {
  'handler' : 'google-indexed-pages',

  'sitelist' : sitelist,

  'proxy' : {
    'proxy_key' : '85a0a8c85a44a97bdbbbf2843841a392',
    'ip' : '45.89.19.81',
    'port' : '6506',
    'ipv6' : '1',
    'type' : 'http',
    'userpwd' : 'k1njT2:mKippdS6sj',
    'service' : 'yandex',
  },


  'task_id' : 1,
  'thread_id' : 1
};



var profilekey = 'google-indexed-pages';

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

