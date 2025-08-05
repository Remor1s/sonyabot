/**
 * Обработка заданий в nodejs
 *
 * @package SerpHunt
 * @subpackage Core
 *
 * cls && cls && "C:\Program Files\nodejs\node.exe" "D:\OpenServer\domains\serphunt\admin\nodejs\test-js\fingerprint.js"
 *
 * clear && clear && /opt/node-v8.8.1-linux-x64/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/fingerprint.js
 * clear && clear &&  /opt/node-v12.14.0-linux-x64/bin/node /home/admin/web/default/public_html/nodejs//test-js/fingerprint.js
 *
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/fingerprint.js
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/default/public_html/nodejs/test-js/fingerprint.js
 */


/**
 * Подключение библиотек
 */
const yandexClass = require( '../modules/yandex/yandex.js' );
const googleClass = require( '../modules/google/google.js' );
const captchaSolverClass = require( '../modules/captcha-solver/captcha-solver.js' );
const mysql = require( 'mysql2' ); //проблемы с сериализацией
const { setTimeout } = require( 'node:timers/promises' );
const { plugin } = require('puppeteer-with-fingerprints');

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
puppeteerAfp = require('puppeteer-afp');

const StealthPlugin = require( 'puppeteer-extra-plugin-stealth' );
puppeteer.use( StealthPlugin() );


/**
 * Настройка переменных
 */
browser = null;
page = null;
_get = null;
_post = {};
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


_post = { 'handler' : 'test-fingerprint' };

//var profilekey = 'bad';
var profilekey = 'test-fingerprint';

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
 * Создание экземпляров необходимых классов
 */
seoa = new seoaClass();


//puppeteer.launch( seoa.puppeteerOptions() ).then( async browser => {
(async () => {
  try
  {
/*
console.log( 11111111 );
  // Replace `puppeteer.launch` method call with `plugin.launch`:
  // const browser = await puppeteer.launch();
  const browser = await plugin.launch();
console.log( 222222222 );
  // The rest of the code is the same as for the standard `puppeteer` library:
  const page = await browser.newPage();
  await page.goto('https://browserleaks.com/canvas', { waitUntil: 'networkidle0' });

  console.log('Canvas signature:', await page.$eval('#crc', (el) => el.innerText));
*/


    browser = await puppeteer.launch( seoa.puppeteerOptions() );

/*
    // I always use this method to get the active page, and not to have to open a new tab
      const initPage = ( await browser.pages() )[0];

      // For these options, all are optional, and you dont have to use them, these are used just if you want to reuse a fingerprint
      const options = {
        canvasRgba: [ 0, 0, 0, 0 ], //all these numbers can be from -5 to 5
        webglData: {
          3379: 32768, //16384, 32768
          3386: {
            0: 32768, // 8192, 16384, 32768
            1: 32768, // 8192, 16384, 32768
          },
          3410: 2, // 2, 4, 8, 16
          3411: 2, // 2, 4, 8, 16
          3412: 16, // 2, 4, 8, 16
          3413: 2, // 2, 4, 8, 16
          7938: "WebGL 1.0 (OpenGL Chromium)", // "WebGL 1.0", "WebGL 1.0 (OpenGL)", "WebGL 1.0 (OpenGL Chromium)"
          33901: {
              0: 1,
              1: 1, // 1, 1024, 2048, 4096, 8192
          },
          33902: {
              0: 1,
              1: 4096, // 1, 1024, 2048, 4096, 8192
          },
          34024: 32768, //16384, 32768
          34047: 8, // 2, 4, 8, 16
          34076: 16384, //16384, 32768
          34921: 16, // 2, 4, 8, 16
          34930: 16, // 2, 4, 8, 16
          35660: 2, // 2, 4, 8, 16
          35661: 32, // 16, 32, 64, 128, 256
          35724: "WebGL GLSL ES", // "WebGL", "WebGL GLSL", "WebGL GLSL ES", "WebGL GLSL ES (OpenGL Chromium)"
          36347: 4096, // 4096, 8192
          36349: 8192, // 1024, 2048, 4096, 8192
          37446: "HD Graphics", // "Graphics", "HD Graphics", "Intel(R) HD Graphics"
        },
        fontFingerprint: {
            noise: 1, // -1, 0, 1, 2
            sign: +1, // -1, +1
        },
        audioFingerprint: {
            getChannelDataIndexRandom: 0.7659530895341677, // all values of Math.random() can be used
            getChannelDataResultRandom: 0.7659530895341677, // all values of Math.random() can be used
            createAnalyserIndexRandom: 0.7659530895341677, // all values of Math.random() can be used
            createAnalyserResultRandom: 0.7659530895341677, // all values of Math.random() can be used
        },
    };

    // this function must run on the initial page, and all other tabs will be protected and using the fingerprint, do not use the initPage for anything
    await puppeteerAfp( initPage, options );
*/


    page = await browser.newPage();


    await page.evaluateOnNewDocument(() => {
        const originalFunction = HTMLCanvasElement.prototype.toDataURL;




        HTMLCanvasElement.prototype.toDataURL = function (type) {

            if (type === 'image/png' && this.width === 220 && this.height === 30) {
                // this is likely a fingerprint attempt, return fake fingerprint

                return 'data:image/png;base64,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';
                //return 'data:image/png;base64,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';

                //return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAAAeCAYAAABHenA+AAAORUlEQVR4Xu1bC1RVZRbeV2vl+OaR4b0kT1MeKigPNVqRUWiSIo0Zatko3CsjMzWPorC3YY+pxmZBeS+tyikzBx9oKlLYknyDDg5eIAMUlYuCCNJDbdV4Z+//nP/ec859QGbeZnHOWrg45////e+9//3t1y8aUB9VA6oGrpkGNNdsJ3WjX40GrHqw/mqYuYaMaEzgcXv3OAPXUN/qVqIGVMB5zhRUwHlO9x7bWQWcx1Tv+RDrOdF7784q4Dx39vIIpzdakBWtAzsa64NgXPyh59i8gp0FWQrAZFh+Bau7X6I3WuH/US8omQo4J8dL9qKx5nRr55mmAzgvTqRQjPY1q3tjsc9wBji5keqNuTg9DzeZjMzs+ynEPTpXBZxL9auAU6iGB5ruHKgAthYbyIR1G/E9u6e27hRwBr1hJBLw5UROnBib4uXdUjVwYPvjhYXGz/B7Mf6kglVTAYX6eDZPGh0dv9uZ0hs34jqtbZ2wlrpmBfizxMa4UnhX9O3r5TyJgGOyWOFTYyyscVCKO5qGlfORzw9ka6Q8iRHOkLl4zpdHJ39WXr7gTZs+9MZ8t7IoGXEvmz3rkOrVud7IGHSiPoVdnDhKV4CLhydhJhyGXChhS3XwCrTAUPZ7HDTBAXiJ/f4hxMODsFAmxQfwLszHGWxLMOJB7sQDTbTNsYKB/U57aOE8WunbtrFsSIdKCGT0u6NNc6V0+b60LgfSwIL/unocupT2cxJsB88Xz/POy1ZYXRgLZTI6hpWT8Hz3cn3qK+GNzvPaad99NzTwZv/aPGMMvOhyY8mAa8BxIxUiXKwh0/Av1OTctUXPpZzv0NqBJhw8GUWFAvnCOwll1cQ6ANNkEPYW6BPQtDhf+i1P8i73JErQkvE7GiNLKV0CTumdpDTtyrWn0oJ382cGLfDNUsqH5j+2eMfni261WMKWsvSVA9WVLMpTca47wUG50yvnARATUp6YxYvZiDPnhsNKwHFg5aEflYKNQMaBQXNmIRjnISwmo1FLAUYgakZgcmMnwBGo+LsUZMthGiwlXy0CkNgl2gTQO+CoW9ocjHytktY+CGbr6dmLNCfBMZm2nQKORyc8z9/et2yXj09zFwLuTSeAExwwniuBTaOBDmPhyh0Ewnnzntw6YGBHiWkCCxpuH6c1XOLtq6C5ORwaGmOFxaIxGw7CJ1u2PppCxoWGPAlHDnz9jW9a0/Go6H0LyxgtnPMefhvX2aGNHjKk9eO1Rc9vJUZx/vunz4Se27z5sXR8b54+fcVJna72lKnQGMQiHubFOGeLVQPbNVaYyrk+eCjFfOjQvQ9xoyL6Fy8OGtnWFnQro5/Umi56dBtPuDa+pjYxcffu9JecAk4AxStuaYoMZFZCUh8NPHK2PSDy0qUBfujNytiBCJF+6dTkgrxmS/i75j9+vCjjEIR1dWg3NJ8KH0360B+CJVJZHA5SAU6SDWn6onxeXV2+32za/MRU7nQc9KqQm/R22nLLi336/njJ76Zj29Hj/m72Z9o60QOX/VcDj78zAerYceI9nNQ4peCh8Rcm+sEHZ1OgvvEdpoVVtwN82w+gE/rDqK4LMHu/oJw6dD2fRwKYETJnYDAkIfkpZoBwixFrkGIYklwCEc0Aa/11CL/fQAI0wJJSIQI+P/FZiPn+DHRUCdGSQLQzAuDsIGD0ndFuNcfBMssi29waf7tt075h6GJpXUUowMPlRjYoi7wu7uHonE42jc3v2/fHdf7+tf2cAk4MDBkGQ1JfK7zK9GlaOZQAN21q/rMjRhwJIp1fCeDkUUH09vFxxWujokrMRpNxmRh651itUI+AacdNlpDxigbTyMKr3WN8Smvuusu06vrrL4Zu2/bIWZxvSZn+9zt1ui8bcGw8rR312oKO4cPrvfr1+xa2ly5h0cJQCelnzwUs37AhN5AEIUeAhg81NYlMrun3vLlOBO2fZDzFwp/F6OA8wklSPpc0kQYBqLlpbO0R8xRAJ0NbtugzDWvRu3kh3w/TBwQc8jTi5eiYLf+kg0Br+MhYaHxNp6vTjon8XCYLZQiom3tth8Kju1J3OCF1S8ihY03jQ6qzi4a60yuXG5e0G42mcKox0MlcR3ts2/6HhlMnI+/H97fxrLxNpBcyQn08dsEWOkQBDqzTDVHwXmM6i1D07cavAe6pErim9wA88VEtAAvjxgLXDUW0FRNz4MINgrGToXclH4CBlwAqy9MxUkax8QHfAxRWZUG/kHpICC2DulJ7Okm0wxGg/h2uaeeWvwIa3Wkg3d5WqmMRuTJEABmBmZ7TXgAbxLbGPyr+Ags6a9k8VxffBDiTETMxIaWc4w5wmZmGBeSA2TmK2Bg77tO5k+LXz5U6NVfA61ENd6Y1OIYI3DTs2BoEmM24ReMKIsDJGKHJCLgJEz55OWbClsh1658K8PU5eXx02O64TZty1oeEVpwMDqx6rH//zoP/qZ4W2JT7Vhga1VNkFK1twek4x48xTKmRVTOPUtJMvX4pCjpP6kUIEGTkLM0978eUxXiies1dDSemud3S7BxOXFATidI7qstm6Q2G5Ri1YkTAFaSlLZ9eY04ckpi4ao9tb5xIzuJMW/AbMlmUTScRcA66E/SX6+1teeS++16YZztghV4d5DaZHiXAoVM4zlIek/EynQ2WA39FsN/NdSeNcEO9TkNW3AqMUedZdKIoQaka1UlluhwWwbghcyPy8noOzqNuKA3MR1VTXUWAWh2RAyew8pcCLq4BQYrg5eMUwer3C2llfrIBTOYMmGOxwCxdCdsru1SITK5oLyhHACPA3goNgPdLqRpxkT5iFKXnyeQcm2zhz7q5BpPU5O5SStTlXJsuryrgpI0GrAWGa+svzEh5bfCOHRkpDcdi7J7gnZV+LGWUMyLkuwgYBEHunr0PtJmPTIm8Z/qKsa2twStixm+prjw486Mb+l344vrrLnZ98eDuGeTFySB4WnWqOTzpXHvApgMVqdWotzw09Gxpeib1ICzNbRkt907uAcc6r65odnRqQ/fvT7vx1NP5tsZR2vaA4zylxLXtDHCiR6SmUv8BXU0+Picypbm/gywZJQ/IPJ+YUsp0xyc4G+MpqKhXB7lNJuom9whwtA1P2ygKfNV5C0sDKRLwWqkixAC1mLaRkfOHg1HanMhKtqeUFNGkgCMQF1jkgCR6lFZmRRdgRRgE+VVH4PuIY7B1UCB8tD9L1vhQ0ua88GhcBmEQ0XADvNh4GNzVcDR/3y2YYThrnomOzG2EE8ElSx+dpZli2i47Z8lL900T+SHfWVk5c9m/D09zMO4xY8paJk8qMjMvKin2qe7jXbxJE4tgzLgyAo5XRUVqRtvZwICEW9d8fPhwcn9v75YZvA6kUD0+qmTvqNF7qgYParcUrXsmLmBE9cXY2OINLC1SXlU4807ddSlxPDqq5AenNK2aOwiQVD8R/1iT6qqr74rGVLZFFuFEwNXVJVjPddx8b1RU6dbVq19qYg6aN00UsjikHcgHymqOjStuEXVn7+LimDu9/lzAkR1I06+N5nSYYjnPQEeNjNSQTRDnv5cBbhZksY4ldTF506MgGWsD/La5eRp01jiPcK4AR/TMIT9ATOhOWFPawFLV+uYoyGvMYjWaM9prfYNhZXmOreFCAMuOHgPJwwSPsL5iERztfF1m60SHHlZb/pwIR0SwcRYYdHhw8t1vNbCUUmy8YV1XYKvrrgBwWoemidgOp7Rv9570ZTW1tzvkujcvy26PCP/CB+svYo1dCPKGAzMyo7EsPGzXxYSEDzdTDbRz50PeR48m+BkM+jYq+Pftnf3wkSNJLHUVH6GOo0YCRtud5QsKgoKqvET6YDNoV95JbLU7yIKNDn4ZTnWjG5obQ0MqU7GIBty7hV2KYtSeMeNvrw/3a/CRRjiWgmB0mTo1P25EYHU21gNJyFaqM1l27Zp/W23dbduldzcy3Sm6re70Kk0pOQ8/JcIpvTCPGpQGxjYCjNNlgDaygupQ2bUABwvp5qvymQjNDazx8W7EUujj296jCMc7jI8mPw0zm9uAGiBpFQC/7xSA6Ip2cXkWGleUjXUelXn9R3xLnQjRHN4pTHf7n5edOW2hM10pPSvvJ55pjYstHra/Io3SambnVD5IU3alXqXvTv8vJTdyafiVgQdRTJ5fmevKinvcRfnOay5igDcPxBbrSAJlH3RElDbyMT6f70P0sM7r5MW/KKitWHXJk6t7OJFHVzT7XsaTlTQ6uA5wWTuvh6R7SvlxJYvYdR2kvCxlsmngIG8t85qWZO1Or0q5bW1r8W5IaRDdXXwXTQQIxNYWGS9vkiTWCGazLRrgO2yM0Li0UcHTU0opedpH0YXXhbSWupBU40lTVKJ3fBjAsC6hO0mPsgmipE10CKDKJgntRQ/xJd2DG3xP/lrAmQ0pAUT6pW82O1Sc3ZUBTnLxzQlIAeaKMV63iGsOKC8ElaChDhFchhAJ80/hWuEynR7eBBFfFfRtwKVhN07AVos5o9sNTSk/7XQpSk0Mnhq6MPaR5DQINA6yFBrvR6/5qj5j8WzoA43SuxspH6wDLHYVRdnYlYEzvV5twCkNhkc++i4FBgcLfSegUWSkxgePKj0BHAcXj6p87+5oS8dpjXK9M6O/UsAxgLk5K9zLwc5dgU79awF37ugXHKNoqekDo3pyWXq12eguwl3t/X4t9HoCuF+aVxVwv7SGXdCn6IdRcj2/jL6WbKiAu5balu+lAs5zuvfYzirgPKZ69e/hPKd6z+2sAs5zulcjnOd0r+7cCzWgAq4XHroqsuc0oALOc7pXd+6FGlAB1wsPXRXZcxpQAec53as790INqIDrhYeuiuw5DaiA85zu1Z17oQZUwPXCQ1dF9pwGVMB5Tvfqzr1QA/8DCQFFpgJoFJgAAAAASUVORK5CYII=';

                //return canvasKey();
            }
            // otherwise, just use the original function
            return originalFunction.apply(this, arguments);
        };
    });

    //await page.setJavaScriptEnabled( false );

    await page.goto( 'https://browserleaks.com/canvas' );


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

/*
function canvasKey(){

  var canv = document.createElement('canvas');

  var context = canv.getContext('2d');


  var grad = context.createLinearGradient(0,0,220,30);

  grad.addColorStop(0, "#dddedf");

  grad.addColorStop(1, "#5062A4");

  context.fillStyle = grad;

  context.fillRect(0, 0, 60, 60);


  var txt = 'canvasprint.js 个個칼'

  //var typefaces = ["sans-serif", "serif", "fantasy", "cursive", "monospace", "-no-font-", navigator.userAgent, screen.width];
  var typefaces = ["sans-serif", "serif", "fantasy", "cursive", "monospace", "-no-font-", 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0', 800 ];

  for (var i = 0; i < typefaces.length; i++){

    var y = 10 + (6 * i);

    var x = i;

    writeOnContext(context, txt, typefaces[i], "rgba(202,56,202,0.53)",x,y);

  }

  return canv.toDataURL();

};
*/