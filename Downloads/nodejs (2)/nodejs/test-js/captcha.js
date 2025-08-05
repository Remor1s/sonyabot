/**
 * Обработка заданий в nodejs
 *
 * @package SerpHunt
 * @subpackage Core
 *
 * cls && cls && "C:\Program Files\nodejs\node.exe" "D:\OpenServer\domains\serphunt\admin\nodejs\test-js\captcha.js"
 *
 * clear && clear && /opt/node-v8.8.1-linux-x64/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/captcha.js
 * clear && clear &&  /opt/node-v12.14.0-linux-x64/bin/node /home/admin/web/default/public_html/nodejs//test-js/captcha.js
 *
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/captcha.js
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/default/public_html/nodejs/test-js/captcha.js
 */


/**
 * Подключение библиотек
 */
const yandexClass = require( '../modules/yandex/yandex.js' );
const googleClass = require( '../modules/google/google.js' );
const captchaSolverClass = require( '../modules/captcha-solver/captcha-solver.js' );
const mysql = require( 'mysql2' ); //проблемы с сериализацией
const { setTimeout } = require( 'node:timers/promises' );

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

const yandex_region_id = '66';
const yandex_region_desktop = yandex_region_id + '_desktop_ru';
const yandex_region_mobile = yandex_region_id + '_mobile_ru';
const region = yandex_region_id + '_' + device + '_ru';

//const region = '1011969_' + device + '_ru';
//const region = '_' + device + '_ru';

const site = 'https://serphunt1.ru/indexing/'; //https://serphunt.ru/positions/
//const site = 'pol-favorit.ru';

const keywordlist = [
  //'мониторинг позиций сasd;flkn', //проверка на поведении при отсутствии пагинации
  //'проверить позиции сайта site:serphunt.ru',
 'полиуретановые полы',
 //'мой ip',
 //'проверка индексации сайта в гугле',
 //'проверка индексации сайта в яндексе',

/*
  'мониторинг позиций сайта', //не позиций
  'позиции сайта',
  'позиции сайта в поисковиках',
  'проверка позиций сайта онлайн'
*/
];


siteOptions = {
  'site_url' : site,
  'positions_with_subdomains' : 0,
   'yandex' : {
      'position_regions' : {
        yandex_region_desktop : {
          'txtfilter' : '0',
          'region_id' : yandex_region_id,
          'domain' : '.ru',
          'country_code' : 'RU',
          'device' : 'desktop',
          'language' : 'ru',
          'search_depth' : '100'
        },
        yandex_region_mobile : {
          'txtfilter' : '0',
          'region_id' : yandex_region_id,
          'domain' : '.ru',
          'country_code' : 'RU',
          'device' : 'mobile',
          'language' : 'ru',
          'search_depth' : '100'
        },
      }
   },
  'google' : {
    'position_regions' : {
      '1011969_desktop_ru' : {
        'region_id' : '1011969',
        'domain' : '.ru',
        'country_code' : 'RU',
        'uule' : 'UTW9zY293LE1vc2NvdyxSdXNzaWE',
        'device' : 'desktop',
        'language' : 'ru',
        'search_depth' : '100'
      },
      '1011969_mobile_ru' : {
        'region_id' : '1011969',
        'domain' : '.ru',
        'country_code' : 'RU',
        'uule' : 'UTW9zY293LE1vc2NvdyxSdXNzaWE',
        'device' : 'mobile',
        'language' : 'ru',
        'search_depth' : '100'
      }
    }
  }
};


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
    //'ip' : '109.248.48.84',
    'ip' : '109.248.142.100',
    'port' : '1050',
    'ipv6' : '0',
    'type' : 'http',
    'userpwd' : 'xBXNwJ:ks96fwIN2U',
    'service' : 'yandex',
  },


/*
  'proxy' : {
    'proxy_key' : '85a0a8c85a44a97bdbbbf2843841a392',
    'ip' : '95.217.104.56',
    'port' : '33149',
    'ipv6' : '0',
    'type' : 'http',
    'userpwd' : 'F3Wkq3iFbgHl:bUifLgN5JK',
    'service' : 'yandex',
  },
*/

/*
  //asocks
  'proxy' : {
    'proxy_key' : '85a0a8c85a44a97bdbbbf2843841a392',
    'ip' : '89.39.106.148',
    'port' : '13630',
    'ipv6' : '0',
    'type' : 'http',
    'userpwd' : '4662002-mobile-country-RU:1znb0fqerv',
    'service' : 'yandex',
  },
*/

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
     * Тестирование Xevil
     */
    let request_data = {
      method: 'base64',
      key: '2a991afa9c8c28fffbc001b0928b78bb',
      phrase: 0,
      regsense: 1,
      json: 1
    };


    let image = fs.readFileSync( 'D:/_captcha/10.jpg' );
    image = image.toString( 'base64' );

    let response = await request.post({
      url: 'http://144.76.109.245:80/in.php?' + querystring.stringify( request_data ),
      form: { body : image }
    });

console.log( response );

    response = JSON.parse( response );

    const task_id = response.request;

    await setTimeout( 1000 );

    while( true )
    {
      await setTimeout( 1000 );

      var geturl =
        'http://144.76.109.245:80/res.php'
          + '?action=get'
          + '&json=1'
          + '&key=2a991afa9c8c28fffbc001b0928b78bb'
          + '&id=' + task_id;

      response = await request.get({ url : geturl });

      console.log(  response );

      if ( response.indexOf( '"status":1,' ) > -1 )
      {
        break;
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

    //await process.exit();
  }
})();
//});

