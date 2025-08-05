/**
 * Обработка заданий в nodejs
 *
 * @package SerpHunt
 * @subpackage Core
 */


/**
 * Подключение библиотек
 */
const yandexClass = require( './modules/yandex/yandex.js' );
const googleClass = require( './modules/google/google.js' );
const captchaSolverClass = require( './modules/captcha-solver/captcha-solver.js' );
const mysql = require( 'mysql2' ); //проблемы с сериализацией

querystring = require( 'querystring' );
md5 = require( 'crypto-js/md5' );
fs = require( 'fs' );
path = require( 'path' );
fileExists = require( 'file-exists' );
isJSON = require( 'is-json' );
php = require( './modules/php/php.js' );
seoaClass = require( './modules/seoadmin/seoadmin.js' );


//puppeteer = require( 'puppeteer' );
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
siteOptions = null;
rootPath = null;
pool = null;
pool = null;
promisePool = null;
yandexCaptcha = null;
//taskObjects = {};
captchaNumbers = {
  authorization: 0,
  parsing: 0
};


rootPath = __dirname.replace(/[\\\/]+nodejs(-new)?$/, '');

if ( __dirname.indexOf( 'admserv.serphunt.ru' ) > -1 )
{
  serverName = 'admserv.serphunt.ru';
}
else if ( __dirname.indexOf( 'testadm.serphunt.ru' ) > -1 )
{
  serverName = 'testadm.serphunt.ru';
}
else
{
  serverName = 'admin.serphunt';
}



if ( process.argv[2] != undefined )
{
  /**
   * Загрузка данных задания
   */
  if ( fs.existsSync( process.argv[2] ) )
  {
    _post = fs.readFileSync( process.argv[2] ).toString();
    _post = php.unserialize( _post );
  }
  else
  {
    console.log( 'data file not exists' );
    process.exit();
  }


  if ( _post.handler != undefined )
  {
    /**
     * Загрузка настроек sephunt
     */
    var optionsFile = rootPath + '/storage/' + serverName + '/options.php';
    seoaOptions = fs.readFileSync( optionsFile ).toString().replace( '<?php exit; ?>', '' );
    seoaOptions = php.unserialize( seoaOptions );
    siteOptions = _post.site_options;

    if ( siteOptions != undefined && typeof siteOptions[ 'positions_with_subdomains' ] == 'undefined' )
    {
      siteOptions[ 'positions_with_subdomains' ] = false;
    }


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
         * Удаление файла блокировки запуска нового браузера
         */
        try
        {
          await fs.rmdirSync( rootPath + '/tmp/' + serverName + '/locks/browser' );
        }
        catch( error )
        {
          //console.log( error );
        }


        /**
         * Отслеживание ошибок необработанных ошибок Pormise
         * https://nodejs.org/api/process.html#process_event_unhandledrejection
         */
        process.on( 'unhandledRejection', ( reason, p ) => {
          //console.error( 'Unhandled Rejection at: Promise', p, '/ reason:', reason );

          if ( promisePool )
          {
            promisePool.end( seoa.dbErrorPorcessing );
          }

          if ( browser )
          {
            browser.close();
          }

          process.exit();
        });


        /**
         * Авторизация прокси
         */
        await seoa.proxyAuth();


        /**
         * Контроль загрузки файлов
         */
        await seoa.setRequestInterception();


        /**
         * Настройка fingerprint
         */
        if ( typeof _post[ 'device' ] != 'undefined' )
        {
          await seoa.setFingerprint( _post.device );
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
        await console.log( '/******************* captcha numbers start *******************/' );
        await console.log( JSON.stringify( captchaNumbers ) );
        await console.log( '/******************** captcha numbers end ********************/' );

        await console.log( "\n" );

        await console.log( '/*********************** response start ***********************/' );
        await console.log( JSON.stringify( output ) );
        await console.log( '/************************ response end ************************/' );


        if ( promisePool )
        {
          await promisePool.end( seoa.dbErrorPorcessing );
        }

        if ( browser )
        {
          await browser.close();
        }

        await process.exit();
      }
      catch ( error )
      {
        await seoa.errorProcessing( error )
      }
    })();
    //});
  }
  else
  {
    process.exit();
  }
}
else
{
  process.exit();
}
