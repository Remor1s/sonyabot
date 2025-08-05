/**
 * Обработка заданий в nodejs
 *
 * @package SerpHunt
 * @subpackage Core
 *
 * cls && cls && "C:\Program Files\nodejs\node.exe" "D:\OpenServer\domains\serphunt\admin\nodejs\test-js\frequency.js"
 *
 * clear && clear && node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/frequency.js
 * clear && clear &&  /opt/node-v12.14.0-linux-x64/bin/node /home/admin/web/default/public_html/nodejs//test-js/frequency.js
 *
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/admserv.serphunt.ru/public_html/nodejs/test-js/frequency.js
 * clear && clear && /home/admin/node/v17.9.1/bin/node /home/admin/web/default/public_html/nodejs/test-js/frequency.js
 */


/**
 * Подключение библиотек
 */
const yandexClass = require( '../modules/yandex/yandex.js' );
const googleClass = require( '../modules/google/google.js' );
const captchaSolverClass = require( '../modules/captcha-solver/captcha-solver.js' );
const mysql = require( 'mysql2' ); //проблемы с сериализацией

querystring = require( 'querystring' );
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
siteOptions = {};
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

const request = require('request-promise-native');

rootPath = __dirname.replace(/[\\\/]+nodejs(-new)?[\\\/]test-js$/, '');

if ( __dirname.indexOf( '.serphunt.ru' ) < 0 )
{
  seoa_test = true;
}



const device = 'desktop';

const region = '213_' + device + '_ru';
//const region = '1011969_' + device + '_ru';
//const region = '_' + device + '_ru';

//const site = 'https://serphunt1.ru/frequency/'; //https://serphunt.ru/frequency/
const site = 'pol-favorit.ru';

const keywordlist = [
  'обучение лимфодренажному массажу в москве',
];



_post = {
  'handler' : 'keywords-frequency',
/*
  'proxy' : {
    'proxy_key' : '85a0a8c85a44a97bdbbbf2843841a392',
    'ip' : '91.243.188.184',
    'port' : '7951',
    'ipv6' : '0',
    'type' : 'http',
    'userpwd' : 'irp1040922:DPgtEfj8jp',
    'service' : 'yandex',
  },
*/

  'proxy' : {
    'proxy_key' : '85a0a8c85a44a97bdbbbf2843841a392',
    'ip' : '185.128.214.241',
    'port' : '7951',
    'ipv6' : '0',
    'type' : 'http',
    'userpwd' : 'irp1040922:DPgtEfj8jp',
    'service' : 'yandex',
  },

/*
//asocks
  'proxy' : {
    'proxy_key' : '85a0a8c85a44a97bdbbbf2843841a392',
    'ip' : '109.236.82.42',
    'port' : '9999',
    'ipv6' : '0',
    'type' : 'http',
    'userpwd' : 'tzrh67f4aw-corp.mobile.res-country-RU-state-524894-hold-session-session-67e88d61dbb75:oR2VEeHjOtbg48Te',
    'service' : 'yandex',
  },
*/

//bela.kochergina@yandex.ru:dr8Sarah8ymI:tjmuokfurrnbkasr:415742135
//rufshvetsov@yandex.ru:jg9Linda8alU:ddailevedloioqeh:34298153

/*
  'account' : {
    'account_key' : '04643ec7cce3f2c69fac74bfc7486c9d',
    'user' : 'komar0vakristina1998@yandex.ru',
    'password' : 'MsVdasSq3v',
    'password_2fa' : '',
    'phone' : '',
    'control_answer' : 'Gpulaber',
    'cookies' : '[{"domain":".yandex.ru","expirationDate":1775073670.0,"httpOnly":true,"name":"receive-cookie-deprecation","path":"/","sameSite":"none","secure":true,"session":false,"value":"1"},{"domain":".yandex.ru","expirationDate":1771969080.637367,"httpOnly":true,"name":"receive-cookie-deprecation","path":"/","sameSite":"none","secure":true,"session":false,"value":"1"},{"domain":".ya.ru","expirationDate":1773045054.340052,"httpOnly":true,"name":"receive-cookie-deprecation","path":"/","sameSite":"none","secure":true,"session":false,"value":"1"},{"domain":".yandex.ru","expirationDate":1774416648.0,"httpOnly":true,"name":"receive-cookie-deprecation","path":"/","sameSite":"none","secure":true,"session":false,"value":"1"},{"domain":"top-fwz1.mail.ru","expirationDate":1774773411.148773,"httpOnly":true,"name":"PVID","path":"/","sameSite":"none","secure":true,"session":false,"value":"2labHb3FptYV00002X13HK2V:::0-0-0-cd3f500-0-d00b862:CAASELsjnPFAk8kAn8ZFfVa3Q3kaYIExbJOcGJTq56Ecca4PKFaSn8Ur_ZKBNvyXb_nL_f38ag13XljmJ01PyWbIAaM5bC7L8-jFMOy-3OB6Xfg7LSA2T4e5WCak-hFdTjgiQ-AbIWtTlF66Rx6bRDYTrs15Yw"},{"domain":"ad.mail.ru","expirationDate":1775159896.720791,"httpOnly":true,"name":"PVID","path":"/","sameSite":"none","secure":true,"session":false,"value":"3oqB9i3Jdq2V00277O2seT2V:::0-0-0-ce70104-0-d069e18:CAASELMZxmlKZnkBD2ZBVvPsaS0aYAfMX8Thd7OR2CgbkzEty4179ffju-dBoAEFE0L_9LZRYLkSsE4l4lI3u4I62xC01I_NOTAz2vorYt8ZsoCS065y6ffTZgJj-8VpRGtxnfPUgzjglhLtjx8HoLNHic-iUg"},{"domain":".yandex.ru","expirationDate":1744747177.0,"httpOnly":false,"name":"cycada","path":"/","sameSite":"none","secure":true,"session":false,"value":"CG1khYszy+jZVckYbLyiFRGDEi26wU4MUjHeDo4cbWQ="},{"domain":".yandex.ru","expirationDate":1778097620.153063,"httpOnly":true,"name":"i","path":"/","sameSite":"none","secure":true,"session":false,"value":"kIiCNoCIIC0w0hekEgzWTypTkL44VEpdkw73ZbZSvA3nOsyl6PLt4f/kCUpDiXMXFBjnUG1RSE/HfMPowbgAWYoya7s="},{"domain":".yandex.ru","expirationDate":1775073619.0,"httpOnly":true,"name":"yashr","path":"/","sameSite":"none","secure":true,"session":false,"value":"6074809461743537619"},{"domain":".yandex.ru","expirationDate":1778097620.96043,"httpOnly":false,"name":"yandexuid","path":"/","sameSite":"none","secure":true,"session":false,"value":"5851273351743537619"},{"domain":".yandex.ru","expirationDate":1775073668.0,"httpOnly":false,"name":"gdpr","path":"/","sameSite":"none","secure":true,"session":false,"value":"0"},{"domain":".yandex.ru","expirationDate":1775073620.0,"httpOnly":false,"name":"_ym_uid","path":"/","sameSite":"none","secure":true,"session":false,"value":"1739196699992280011"},{"domain":".yandex.ru","expirationDate":1775073620.0,"httpOnly":false,"name":"_ym_d","path":"/","sameSite":"none","secure":true,"session":false,"value":"1743537621"},{"domain":".yandex.ru","expirationDate":1743609620.0,"httpOnly":false,"name":"_ym_isad","path":"/","sameSite":"none","secure":true,"session":false,"value":"2"},{"domain":"mc.yandex.ru","expirationDate":0.0,"httpOnly":false,"name":"yabs-sid","path":"/","sameSite":"none","secure":true,"session":true,"value":"2404579321743537620"},{"domain":".yandex.ru","expirationDate":1778097620.960503,"httpOnly":false,"name":"yuidss","path":"/","sameSite":"none","secure":true,"session":false,"value":"5851273351743537619"},{"domain":".yandex.ru","expirationDate":1775073620.0,"httpOnly":false,"name":"ymex","path":"/","sameSite":"none","secure":true,"session":false,"value":"2058897620.yrts.1743537620"},{"domain":".yandex.ru","expirationDate":1743539436.0,"httpOnly":false,"name":"_ym_visorc","path":"/","sameSite":"none","secure":true,"session":false,"value":"b"},{"domain":".yandex.ru","expirationDate":1746129633.0,"httpOnly":false,"name":"spravka","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"dD0xNzQzNTM3NjMzO2k9MTA5LjE2NS40NC4yNDY7RD1EMkI4NkNBQ0ZBOTQ2NzJFQUQzNTE3NDMxOEY2QjA1NDlGQ0U5RTU5QjU1RkJDMkU4NTUyOTU2QjBFN0QwNjhENTc1MzkxMTc5NzIxMzNCQjJGMERBMzJDM0VDODg1MDQ4QjdERDEwRkU2MjFENkNCMkJEMEZENkMyMTY3NTUwNjFDMzZFRTdERTQ4QTg0MjE4RDMyMjUxRTk3NTI7dT0xNzQzNTM3NjMzMDg2NDUzNjU4O2g9NDU5ODE0MGM2NDg0OTlhZGM2N2QwYTgyY2M3MDJiZDc="},{"domain":".360.yandex.ru","expirationDate":1778097634.114148,"httpOnly":false,"name":"adrcid","path":"/","sameSite":"none","secure":true,"session":false,"value":"AoAM3ZSWGgaBHPY3a1v0dRA"},{"domain":".yandex.ru","expirationDate":1778097634.114317,"httpOnly":false,"name":"adrcid","path":"/","sameSite":"none","secure":true,"session":false,"value":"AoAM3ZSWGgaBHPY3a1v0dRA"},{"domain":".adriver.ru","expirationDate":1778097634.349781,"httpOnly":false,"name":"cid","path":"/","sameSite":"none","secure":true,"session":false,"value":"0"},{"domain":"passport.yandex.ru","expirationDate":1778097635.513675,"httpOnly":true,"name":"uniqueuid","path":"/","sameSite":"lax","secure":true,"session":false,"value":"969402501743537635"},{"domain":".yandex.ru","expirationDate":1778097663.21018,"httpOnly":true,"name":"Session_id","path":"/","sameSite":"none","secure":true,"session":false,"value":"3:1743537662.5.0.1743537662823:9iylbQ:3eda.1.2:1|1105782161.0.2.3:1743537662|3:10305365.71816.sd3T9WbiI_DN3Sl6sMot1jfno8A"},{"domain":".yandex.ru","expirationDate":1778097663.210386,"httpOnly":true,"name":"sessar","path":"/","sameSite":"none","secure":true,"session":false,"value":"1.1200.CiBEnRAenYDWoSO1ot5yu2vPalWEmkq_fsiyDWRJ1pKzOw.pKAbhfGnNH0GEjPiFtx7-4WOlAuw04qBESmyYC4Fsb0"},{"domain":".yandex.ru","expirationDate":1778097663.21047,"httpOnly":true,"name":"sessionid2","path":"/","sameSite":"none","secure":true,"session":false,"value":"3:1743537662.5.0.1743537662823:9iylbQ:3eda.1.2:1|1105782161.0.2.3:1743537662|3:10305365.71816.fakesign0000000000000000000"},{"domain":".passport.yandex.ru","expirationDate":1778097663.210503,"httpOnly":true,"name":"sessguard","path":"/","sameSite":"none","secure":true,"session":false,"value":"1.1743537662.1743537662823:9iylbQ:3eda..3.500:52387.AHmvccNI.sVay-CziI4ea9NrboB9tnVpD-YQ"},{"domain":".yandex.ru","expirationDate":1778097663.210561,"httpOnly":false,"name":"yp","path":"/","sameSite":"none","secure":true,"session":false,"value":"2058897662.udn.cDoxMNC%2B0LzQsNGA0L7QstCwINCaLg%3D%3D"},{"domain":".yandex.ru","expirationDate":1778097663.21062,"httpOnly":false,"name":"L","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"cxRyQ0ZJVUR0QAt1dWdxaGZhWgN7ZEtjKjhdVSVoNycHB1whIwQ4UlMKDEs=.1743537662.16105.398393.efbda8250fff8a3e013d47642595f8a0"},{"domain":".yandex.ru","expirationDate":1775073663.210662,"httpOnly":false,"name":"yandex_login","path":"/","sameSite":"none","secure":true,"session":false,"value":"komar0vakristina1998"},{"domain":".passport.yandex.ru","expirationDate":1778097663.21074,"httpOnly":false,"name":"mda2_beacon","path":"/","sameSite":"none","secure":true,"session":false,"value":"1743537662845"},{"domain":".passport.yandex.ru","expirationDate":1778097663.369994,"httpOnly":true,"name":"lah","path":"/","sameSite":"none","secure":true,"session":false,"value":"2:1806609662.10040511.bGoMMZdootsFKq4o.lF_x1ZNVJUsv46cErcztwSntp0rrjMIMXAoE8WGSy0VJIThrwtaqO1uFD5e2VdkZYi31qol_.y1NvBi_VIRm0XDfZwLCoWg"},{"domain":"passport.yandex.ru","expirationDate":0.0,"httpOnly":true,"name":"pf","path":"/","sameSite":"unspecified","secure":false,"session":true,"value":"eyJmbGFzaCI6e319"},{"domain":"passport.yandex.ru","expirationDate":0.0,"httpOnly":true,"name":"pf.sig","path":"/","sameSite":"unspecified","secure":false,"session":true,"value":"WEkihpon3qfXt708UtZSzfT2k62TloAdz1jg6_iLs5Q"},{"domain":".yandex.ru","expirationDate":0.0,"httpOnly":false,"name":"ys","path":"/","sameSite":"none","secure":true,"session":true,"value":"udn.cDoxMNC%2B0LzQsNGA0L7QstCwINCaLg%3D%3D#c_chck.1145035778"},{"domain":".passport.yandex.ru","expirationDate":1778097665.005462,"httpOnly":false,"name":"mda2_domains","path":"/","sameSite":"unspecified","secure":true,"session":false,"value":"ya.ru"},{"domain":".ya.ru","expirationDate":1778097665.199263,"httpOnly":true,"name":"Session_id","path":"/","sameSite":"none","secure":true,"session":false,"value":"3:1743537664.5.0.1743537662823:9iylbQ:3eda.1.2:1|1105782161.0.2.3:1743537662|6:10199729.373865.x1kttqgyZqk4v7Y2sGMLh5Ptw8w"},{"domain":".ya.ru","expirationDate":1778097665.19946,"httpOnly":true,"name":"sessar","path":"/","sameSite":"none","secure":true,"session":false,"value":"1.1200.CiArZrR1xWhqDG5cn0XeX5UrHLA6b2_Awg-__NH0hqCQFw.Ou5sKoMUxcHHAkrGMwVQy_S1nQ4eFkN_ccBDQ5oHsnI"},{"domain":".ya.ru","expirationDate":1775073665.199603,"httpOnly":false,"name":"yandex_login","path":"/","sameSite":"none","secure":true,"session":false,"value":"komar0vakristina1998"},{"domain":".ya.ru","expirationDate":1778097665.19965,"httpOnly":false,"name":"yp","path":"/","sameSite":"none","secure":true,"session":false,"value":"2058897664.udn.cDoxMNC%2B0LzQsNGA0L7QstCwINCaLg%3D%3D"},{"domain":".ya.ru","expirationDate":0.0,"httpOnly":false,"name":"ys","path":"/","sameSite":"none","secure":true,"session":true,"value":"udn.cDoxMNC%2B0LzQsNGA0L7QstCwINCaLg%3D%3D#c_chck.1145035778"},{"domain":".ya.ru","expirationDate":1778097665.199751,"httpOnly":true,"name":"i","path":"/","sameSite":"none","secure":true,"session":false,"value":"kIiCNoCIIC0w0hekEgzWTypTkL44VEpdkw73ZbZSvA3nOsyl6PLt4f/kCUpDiXMXFBjnUG1RSE/HfMPowbgAWYoya7s="},{"domain":".ya.ru","expirationDate":1778097665.1998,"httpOnly":false,"name":"yandexuid","path":"/","sameSite":"none","secure":true,"session":false,"value":"5851273351743537619"},{"domain":".ya.ru","expirationDate":1778097665.199848,"httpOnly":false,"name":"L","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"cxRyQ0ZJVUR0QAt1dWdxaGZhWgN7ZEtjKjhdVSVoNycHB1whIwQ4UlMKDEs=.1743537662.16105.398393.efbda8250fff8a3e013d47642595f8a0"},{"domain":".ya.ru","expirationDate":1778097665.199897,"httpOnly":false,"name":"mda2_beacon","path":"/","sameSite":"none","secure":true,"session":false,"value":"1743537664673"},{"domain":".ya.ru","expirationDate":1778097665.199925,"httpOnly":false,"name":"_yasc","path":"/","sameSite":"unspecified","secure":true,"session":false,"value":"YE/WPkRVKPbGhp9HdWVSL1bf8CMkmPlH9uevsYLV74vRRqSOh//4fO8T7FHEzdQW8Q=="},{"domain":".ya.ru","expirationDate":1743548465.0,"httpOnly":false,"name":"sso_status","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"sso.passport.yandex.ru:synchronized"},{"domain":".yandex.ru","expirationDate":1778097667.086315,"httpOnly":false,"name":"is_gdpr","path":"/","sameSite":"none","secure":true,"session":false,"value":"0"},{"domain":".yandex.ru","expirationDate":1744142468.702343,"httpOnly":false,"name":"yabs-vdrf","path":"/","sameSite":"none","secure":true,"session":false,"value":"A0"},{"domain":".yandex.ru","expirationDate":1778097669.676912,"httpOnly":false,"name":"is_gdpr_b","path":"/","sameSite":"none","secure":true,"session":false,"value":"CKKpXBCvuAIoAg=="},{"domain":"mail.yandex.ru","expirationDate":1778097669.74697,"httpOnly":false,"name":"stngs","path":"/","sameSite":"unspecified","secure":true,"session":false,"value":"stngs.1%3Acolorful%3A%3Atrue%3Atrue"},{"domain":".yandex.ru","expirationDate":1778097669.872558,"httpOnly":false,"name":"_yasc","path":"/","sameSite":"unspecified","secure":true,"session":false,"value":"3LF1W5oMfPKL+gHhOtrgxTKQWf+b49JTTw17w/6psb2nXVWJ8VTAl5yz43/hvM+recw9RexXOw=="},{"domain":".yandex.ru","expirationDate":1778097670.90121,"httpOnly":false,"name":"bh","path":"/","sameSite":"none","secure":true,"session":false,"value":"EkAiTm90IEEoQnJhbmQiO3Y9IjgiLCAiQ2hyb21pdW0iO3Y9IjEzMiIsICJHb29nbGUgQ2hyb21lIjt2PSIxMzIiGgN4ODYiDjEzMi4wLjY4MzQuMTExKgI/MDoJIldpbmRvd3MiQgYxNS4wLjBKAjY0UloiTm90IEEoQnJhbmQiO3Y9IjguMC4wLjAiLCJDaHJvbWl1bSI7dj0iMTMyLjAuNjgzNC4xMTEiLCJHb29nbGUgQ2hyb21lIjt2PSIxMzIuMC42ODM0LjExMSJghoyxvwZqHtzK4f8IktihsQOfz+HqA/v68OcN6//99g+h6M+HCA=="},{"domain":"mail.yandex.ru","expirationDate":1744142474.0,"httpOnly":false,"name":"ymai_iale","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"0"}]'
  },
*/

/*
  'account' : {
    'account_key' : '04643ec7cce3f2c69fac74bfc7486c9d',
    'user' : 'innamihailova88.inna@yandex.ru',
    'password' : 'RBx4pYmuCq',
    'password_2fa' : '',
    'phone' : '',
    'control_answer' : 'Tuxjexo',
    'cookies' : '[{"domain":".yandex.ru","expirationDate":1775073854.0,"httpOnly":true,"name":"receive-cookie-deprecation","path":"/","sameSite":"none","secure":true,"session":false,"value":"1"},{"domain":".yandex.ru","expirationDate":1771969080.637367,"httpOnly":true,"name":"receive-cookie-deprecation","path":"/","sameSite":"none","secure":true,"session":false,"value":"1"},{"domain":".ya.ru","expirationDate":1773045054.340052,"httpOnly":true,"name":"receive-cookie-deprecation","path":"/","sameSite":"none","secure":true,"session":false,"value":"1"},{"domain":".yandex.ru","expirationDate":1774416648.0,"httpOnly":true,"name":"receive-cookie-deprecation","path":"/","sameSite":"none","secure":true,"session":false,"value":"1"},{"domain":"top-fwz1.mail.ru","expirationDate":1774773411.148773,"httpOnly":true,"name":"PVID","path":"/","sameSite":"none","secure":true,"session":false,"value":"2labHb3FptYV00002X13HK2V:::0-0-0-cd3f500-0-d00b862:CAASELsjnPFAk8kAn8ZFfVa3Q3kaYIExbJOcGJTq56Ecca4PKFaSn8Ur_ZKBNvyXb_nL_f38ag13XljmJ01PyWbIAaM5bC7L8-jFMOy-3OB6Xfg7LSA2T4e5WCak-hFdTjgiQ-AbIWtTlF66Rx6bRDYTrs15Yw"},{"domain":"ad.mail.ru","expirationDate":1775159896.720791,"httpOnly":true,"name":"PVID","path":"/","sameSite":"none","secure":true,"session":false,"value":"3oqB9i3Jdq2V00277O2seT2V:::0-0-0-ce70104-0-d069e18:CAASELMZxmlKZnkBD2ZBVvPsaS0aYAfMX8Thd7OR2CgbkzEty4179ffju-dBoAEFE0L_9LZRYLkSsE4l4lI3u4I62xC01I_NOTAz2vorYt8ZsoCS065y6ffTZgJj-8VpRGtxnfPUgzjglhLtjx8HoLNHic-iUg"},{"domain":".yandex.ru","expirationDate":1744747354.0,"httpOnly":false,"name":"cycada","path":"/","sameSite":"none","secure":true,"session":false,"value":"Sx0HpQfqcf0RoJYhXV+07BGDEi26wU4MUjHeDo4cbWQ="},{"domain":".yandex.ru","expirationDate":1778097788.844352,"httpOnly":true,"name":"i","path":"/","sameSite":"none","secure":true,"session":false,"value":"Nx4AEPfWt4hDhEafACVVfW2eDl/ziq3SVF1j95zmjWlyCRNbvJw8IxFK6xZ8ZEFJT6svh/9nDDlACAFfZGKjg08x+/s="},{"domain":".yandex.ru","expirationDate":1778097789.464529,"httpOnly":false,"name":"yandexuid","path":"/","sameSite":"none","secure":true,"session":false,"value":"5857590221743537788"},{"domain":".yandex.ru","expirationDate":1775073788.0,"httpOnly":true,"name":"yashr","path":"/","sameSite":"none","secure":true,"session":false,"value":"8222978181743537788"},{"domain":".yandex.ru","expirationDate":1775073853.0,"httpOnly":false,"name":"gdpr","path":"/","sameSite":"none","secure":true,"session":false,"value":"0"},{"domain":".yandex.ru","expirationDate":1775073789.0,"httpOnly":false,"name":"_ym_uid","path":"/","sameSite":"none","secure":true,"session":false,"value":"1739196699992280011"},{"domain":".yandex.ru","expirationDate":1775073789.0,"httpOnly":false,"name":"_ym_d","path":"/","sameSite":"none","secure":true,"session":false,"value":"1743537789"},{"domain":".yandex.ru","expirationDate":1743609789.0,"httpOnly":false,"name":"_ym_isad","path":"/","sameSite":"none","secure":true,"session":false,"value":"2"},{"domain":"mc.yandex.ru","expirationDate":0.0,"httpOnly":false,"name":"yabs-sid","path":"/","sameSite":"none","secure":true,"session":true,"value":"2052691301743537789"},{"domain":".yandex.ru","expirationDate":1778097789.464671,"httpOnly":false,"name":"yuidss","path":"/","sameSite":"none","secure":true,"session":false,"value":"5857590221743537788"},{"domain":".yandex.ru","expirationDate":1775073789.0,"httpOnly":false,"name":"ymex","path":"/","sameSite":"none","secure":true,"session":false,"value":"2058897789.yrts.1743537789"},{"domain":".yandex.ru","expirationDate":1743539595.0,"httpOnly":false,"name":"_ym_visorc","path":"/","sameSite":"none","secure":true,"session":false,"value":"b"},{"domain":".yandex.ru","expirationDate":1746129791.632096,"httpOnly":false,"name":"spravka","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"dD0xNzQzNTM3NzkxO2k9MTA5LjE2NS40NC4yNDY7RD1BMUQ0N0RCQkY4MENGMDM3N0E2RTk1RDkxRDE3QjU5MzkxMTlBNkE1RTJEQjNGNERBNjJERjMzNEFFNUY4RDgxNTI0Nzc3MUIyNjhDREM2NTI2NEZCMUY2ODNDRTI0NkMyNjc4NkY1OTBGRjU4MThGMTVENDZBRUM1OThDM0UxNjIwNTRBOUVERDYwRUMxQUYxMUQ4Mjc0RDAyNDQ7dT0xNzQzNTM3NzkxMzAyNTYxMTE5O2g9NjliMjZiODkyMTkyMTcwYmE5M2M0OGVkMzQyYTgyZjg="},{"domain":".360.yandex.ru","expirationDate":1778097792.775947,"httpOnly":false,"name":"adrcid","path":"/","sameSite":"none","secure":true,"session":false,"value":"AoAM3ZSWGgaBHPY3a1v0dRA"},{"domain":".yandex.ru","expirationDate":1778097792.776136,"httpOnly":false,"name":"adrcid","path":"/","sameSite":"none","secure":true,"session":false,"value":"AoAM3ZSWGgaBHPY3a1v0dRA"},{"domain":".adriver.ru","expirationDate":1778097792.989491,"httpOnly":false,"name":"cid","path":"/","sameSite":"none","secure":true,"session":false,"value":"0"},{"domain":".content.adriver.ru","expirationDate":0.0,"httpOnly":false,"name":"sd","path":"/","sameSite":"none","secure":true,"session":true,"value":"1"},{"domain":"passport.yandex.ru","expirationDate":1778097794.410797,"httpOnly":true,"name":"uniqueuid","path":"/","sameSite":"lax","secure":true,"session":false,"value":"645010501743537793"},{"domain":".content.adriver.ru","expirationDate":0.0,"httpOnly":false,"name":"rs","path":"/","sameSite":"none","secure":true,"session":true,"value":"0"},{"domain":".yandex.ru","expirationDate":1778097800.03273,"httpOnly":false,"name":"_yasc","path":"/","sameSite":"unspecified","secure":true,"session":false,"value":"DP6RA62GJo2ujyvhjyDrTDwA0WUMl6pfqRJK4Rk5zSRfSumsZtKVHLR4sw8TIio14k902GRwB0c="},{"domain":".yandex.ru","expirationDate":1778097846.968158,"httpOnly":true,"name":"Session_id","path":"/","sameSite":"none","secure":true,"session":false,"value":"3:1743537846.5.0.1743537846614:9iylbQ:aa62.1.2:1|1096613207.0.2.3:1743537846|3:10305365.35468.2HrZRcJRq2PJ0jSsDiPe84Zfmaw"},{"domain":".yandex.ru","expirationDate":1778097846.968268,"httpOnly":true,"name":"sessar","path":"/","sameSite":"none","secure":true,"session":false,"value":"1.1200.CiBjiVuA3FeZPGsds-5xBWOZLWA5PuOQ43wrWennsdkYLw.wR2vSTD0X29Y2zFzHfyVY6RbDfijxdnPM-s6W27Zl8I"},{"domain":".yandex.ru","expirationDate":1778097846.968323,"httpOnly":true,"name":"sessionid2","path":"/","sameSite":"none","secure":true,"session":false,"value":"3:1743537846.5.0.1743537846614:9iylbQ:aa62.1.2:1|1096613207.0.2.3:1743537846|3:10305365.35468.fakesign0000000000000000000"},{"domain":".passport.yandex.ru","expirationDate":1778097846.968353,"httpOnly":true,"name":"sessguard","path":"/","sameSite":"none","secure":true,"session":false,"value":"1.1743537846.1743537846614:9iylbQ:aa62..3.500:52387.HKG2Pxu9.4CdaKW0AhGl-SHjTwX4Rdo1JEQM"},{"domain":".yandex.ru","expirationDate":1778097846.968381,"httpOnly":false,"name":"yp","path":"/","sameSite":"none","secure":true,"session":false,"value":"2058897846.udn.cDppbm5hbWloYWlsb3ZhODguaW5uYQ%3D%3D"},{"domain":".yandex.ru","expirationDate":1778097846.968425,"httpOnly":false,"name":"L","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"cxRyQ0ZIXEd1SQp2c2F3bWZhXwh2ZEBkKDleVToxKScFGVokNlVuHQtdWxI=.1743537846.16105.365009.35d0e6155dd144de46b6d57714fd3dda"},{"domain":".yandex.ru","expirationDate":1775073846.968448,"httpOnly":false,"name":"yandex_login","path":"/","sameSite":"none","secure":true,"session":false,"value":"innamihailova88.inna"},{"domain":".passport.yandex.ru","expirationDate":1778097846.968495,"httpOnly":false,"name":"mda2_beacon","path":"/","sameSite":"none","secure":true,"session":false,"value":"1743537846627"},{"domain":".passport.yandex.ru","expirationDate":1778097847.120441,"httpOnly":true,"name":"lah","path":"/","sameSite":"none","secure":true,"session":false,"value":"2:1806609846.10040511.FqltiFy2tCzhWkw3.7IZAs-beOF-Cp8Tvc6RAiDRaelQVPgjTZ1Qp2mZoLg5VY-VZLsMlziGVGYHK39l3y-rakcq_.5vS8HPgDfgCuYeH-scbX0Q"},{"domain":"passport.yandex.ru","expirationDate":0.0,"httpOnly":true,"name":"pf","path":"/","sameSite":"unspecified","secure":false,"session":true,"value":"eyJmbGFzaCI6e319"},{"domain":"passport.yandex.ru","expirationDate":0.0,"httpOnly":true,"name":"pf.sig","path":"/","sameSite":"unspecified","secure":false,"session":true,"value":"WEkihpon3qfXt708UtZSzfT2k62TloAdz1jg6_iLs5Q"},{"domain":".yandex.ru","expirationDate":0.0,"httpOnly":false,"name":"ys","path":"/","sameSite":"none","secure":true,"session":true,"value":"udn.cDppbm5hbWloYWlsb3ZhODguaW5uYQ%3D%3D#c_chck.2184388947"},{"domain":".passport.yandex.ru","expirationDate":1778097848.846348,"httpOnly":false,"name":"mda2_domains","path":"/","sameSite":"unspecified","secure":true,"session":false,"value":"ya.ru"},{"domain":".ya.ru","expirationDate":1778097849.042525,"httpOnly":true,"name":"Session_id","path":"/","sameSite":"none","secure":true,"session":false,"value":"3:1743537848.5.0.1743537846614:9iylbQ:aa62.1.2:1|1096613207.0.2.3:1743537846|6:10199729.498202.3zqG8wUjzrE9rNKPcO7I0JfKq1o"},{"domain":".ya.ru","expirationDate":1778097849.042677,"httpOnly":true,"name":"sessar","path":"/","sameSite":"none","secure":true,"session":false,"value":"1.1200.CiC9gvHETggqyHai6Kx-UmD_vsaLvofWOmJglzFku7NVSQ.wCn4pkIFF6VHck7slieXrc-lwgLn-6Y2bRXuE9d5Wp0"},{"domain":".ya.ru","expirationDate":1775073849.042806,"httpOnly":false,"name":"yandex_login","path":"/","sameSite":"none","secure":true,"session":false,"value":"innamihailova88.inna"},{"domain":".ya.ru","expirationDate":1778097849.042849,"httpOnly":false,"name":"yp","path":"/","sameSite":"none","secure":true,"session":false,"value":"2058897848.udn.cDppbm5hbWloYWlsb3ZhODguaW5uYQ%3D%3D"},{"domain":".ya.ru","expirationDate":0.0,"httpOnly":false,"name":"ys","path":"/","sameSite":"none","secure":true,"session":true,"value":"udn.cDppbm5hbWloYWlsb3ZhODguaW5uYQ%3D%3D#c_chck.2184388947"},{"domain":".ya.ru","expirationDate":1778097849.042943,"httpOnly":true,"name":"i","path":"/","sameSite":"none","secure":true,"session":false,"value":"Nx4AEPfWt4hDhEafACVVfW2eDl/ziq3SVF1j95zmjWlyCRNbvJw8IxFK6xZ8ZEFJT6svh/9nDDlACAFfZGKjg08x+/s="},{"domain":".ya.ru","expirationDate":1778097849.042991,"httpOnly":false,"name":"yandexuid","path":"/","sameSite":"none","secure":true,"session":false,"value":"5857590221743537788"},{"domain":".ya.ru","expirationDate":1778097849.043039,"httpOnly":false,"name":"L","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"cxRyQ0ZIXEd1SQp2c2F3bWZhXwh2ZEBkKDleVToxKScFGVokNlVuHQtdWxI=.1743537846.16105.365009.35d0e6155dd144de46b6d57714fd3dda"},{"domain":".ya.ru","expirationDate":1778097849.043098,"httpOnly":false,"name":"mda2_beacon","path":"/","sameSite":"none","secure":true,"session":false,"value":"1743537848513"},{"domain":".ya.ru","expirationDate":1778097849.043134,"httpOnly":false,"name":"_yasc","path":"/","sameSite":"unspecified","secure":true,"session":false,"value":"bL4xgOA8R0YYV//ocWHM4wxly/EU5QOaDWO8yrfLcrVWbh6wyCCujQgeDyf+0Pu5Aw=="},{"domain":".ya.ru","expirationDate":1743548649.0,"httpOnly":false,"name":"sso_status","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"sso.passport.yandex.ru:synchronized"},{"domain":".yandex.ru","expirationDate":1778097851.077393,"httpOnly":false,"name":"is_gdpr","path":"/","sameSite":"none","secure":true,"session":false,"value":"0"},{"domain":".yandex.ru","expirationDate":1744142652.608721,"httpOnly":false,"name":"yabs-vdrf","path":"/","sameSite":"none","secure":true,"session":false,"value":"A0"},{"domain":".yandex.ru","expirationDate":1778097853.635079,"httpOnly":false,"name":"is_gdpr_b","path":"/","sameSite":"none","secure":true,"session":false,"value":"CKKpXBCvuAIoAg=="},{"domain":"mail.yandex.ru","expirationDate":1778097854.279625,"httpOnly":false,"name":"stngs","path":"/","sameSite":"unspecified","secure":true,"session":false,"value":"stngs.1%3Acolorful%3A%3Atrue%3Atrue"},{"domain":"mail.yandex.ru","expirationDate":1743537864.0,"httpOnly":false,"name":"app_badge_up_to_date_1096613207","path":"/","sameSite":"unspecified","secure":false,"session":false,"value":"1"},{"domain":".yandex.ru","expirationDate":1778097854.0,"httpOnly":false,"name":"bh","path":"/","sameSite":"none","secure":true,"session":false,"value":"EkAiTm90IEEoQnJhbmQiO3Y9IjgiLCAiQ2hyb21pdW0iO3Y9IjEzMiIsICJHb29nbGUgQ2hyb21lIjt2PSIxMzIiKgI/MDoJIldpbmRvd3MiYL6Nsb8Gah7cyuH/CJLYobEDn8/h6gP7+vDnDev//fYPoejPhwg="}]'
  },
*/
//darwind0walu:KcTmC7aSG:Darwin:Alu:28.11.1994:Gravelly:Gaither
//isadorseedsbm:Ww11u8E7:Luczkowiak
/*
  'account' : {
    'account_key' : '04643ec7cce3f2c69fac74bfc7486c9d',
    'user' : 'evette0hohmann',
    'password' : 'BxbbTzvM3u',
    'password_2fa' : '',
    'phone' : '',
    'control_answer' : 'Kimeo',
    'cookies' : ''
  },
*/


  'account' : {
    'account_key' : '04643ec7cce3f2c69fac74bfc7486c9d',
    'user' : 'ebenezermcoats',
    'password' : 'r35cy18Ce91',
    'password_2fa' : '',
    'phone' : '',
    'control_answer' : 'Voelker',
    'cookies' : '[{"name":"mda2_domains","value":"ya.ru","domain":".passport.yandex.ru","path":"/","expires":1779267862.023526,"size":17,"httpOnly":false,"secure":true,"session":false,"sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"mda2_beacon","value":"1744707862135","domain":".passport.yandex.ru","path":"/","expires":1779267860.545931,"size":24,"httpOnly":false,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"lah","value":"2:1807779862.10040845.ekLbzajf65rkymIv.FND7I75pzUifhK3mKpLQrlNqNTOeGz-34yJI3cLWFPa3CO5SiOq1mt82HSE9Ew.iUWALTIYY0tybkBjNaljhQ","domain":".passport.yandex.ru","path":"/","expires":1779267860.545846,"size":127,"httpOnly":true,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"yp","value":"2060067862.udn.cDplYmVuZXplcm1jb2F0cw%3D%3D","domain":".yandex.ru","path":"/","expires":1779267860.545534,"size":45,"httpOnly":false,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"L","value":"eVB5dnV/Y0V9B0RBDkhBcWZ3a0ZIc3VaPFUQARYOBCBeCCUCLTA=.1744707862.16120.393586.b134c3d0c1b2da8e535107b8802c8b1a","domain":".yandex.ru","path":"/","expires":1779267860.545678,"size":110,"httpOnly":false,"secure":false,"session":false,"sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"sessguard","value":"1.1744707862.1744707862126:YYx3sA:ed7d..3.500:52721._uQTZ98i.w4dY3KaM6trE28RhAD-8_Io0VA8","domain":".passport.yandex.ru","path":"/","expires":1779267860.545438,"size":97,"httpOnly":true,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"Session_id","value":"3:1744707862.5.0.1744707862126:YYx3sA:ed7d.1.2:1|740796426.0.2.3:1744707862|3:10306033.853424.9TQuFnE0RvuPSo_Aspzxwtc45Pk","domain":".yandex.ru","path":"/","expires":1779267860.544985,"size":131,"httpOnly":true,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"receive-cookie-deprecation","value":"1","domain":".yandex.ru","path":"/","expires":1776243845,"size":27,"httpOnly":true,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443,"partitionKey":{"topLevelSite":"https://yandex.ru","hasCrossSiteAncestor":false}},{"name":"sessionid2","value":"3:1744707862.5.0.1744707862126:YYx3sA:ed7d.1.2:1|740796426.0.2.3:1744707862|3:10306033.853424.fakesign0000000000000000000","domain":".yandex.ru","path":"/","expires":1779267860.545315,"size":131,"httpOnly":true,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"_yasc","value":"jJZOIyCUtJHBunRFxRsdkooUNZq3xFdHTsrkoQzasIIHbwxG1oVfkQ5jw5+I2xVF/Ro=","domain":".yandex.ru","path":"/","expires":1779267843.749027,"size":73,"httpOnly":false,"secure":true,"session":false,"sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"ys","value":"udn.cDplYmVuZXplcm1jb2F0cw%3D%3D#c_chck.2827845321","domain":".yandex.ru","path":"/","expires":-1,"size":52,"httpOnly":false,"secure":true,"session":true,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"yandexuid","value":"5431613041744707842","domain":".yandex.ru","path":"/","expires":1779267841.110446,"size":28,"httpOnly":false,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"bh","value":"EkIiR29vZ2xlIENocm9tZSI7dj0iMTM1IiwgIiBOb3Q7QSBCcmFuZCI7dj0iOTkiLCAiQ2hyb21pdW0iO3Y9IjEzNSIqAj8wOgkiV2luZG93cyJghcL4vwZqHtzK4f8IktihsQOfz+HqA/v68OcN6//99g/E08+HCA==","domain":".yandex.ru","path":"/","expires":1779267843.815034,"size":166,"httpOnly":false,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"yandex_login","value":"ebenezermcoats","domain":".yandex.ru","path":"/","expires":1776243860.545784,"size":26,"httpOnly":false,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"yashr","value":"3502074191744707842","domain":".yandex.ru","path":"/","expires":1776243841.110489,"size":24,"httpOnly":true,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"i","value":"Kllik59YF5cu9o1wQOp3mjHKfUwbdJ6ixG139IlujOO7W5BL3XLzPytLYrsfZOLOUdlmXdS1SUXRdLSu0iAcx3o1+hk=","domain":".yandex.ru","path":"/","expires":1779267841.11036,"size":93,"httpOnly":true,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"sessar","value":"1.1201.CiAiyJMHoCTYtzoX7PClekrWzOJQfcYQ-I-nDS1Lm_a-TA.YYtzQCxoY7b8-gRvPBEYWvbdkv7W4EJdnL0nHgdKWwA","domain":".yandex.ru","path":"/","expires":1779267860.545172,"size":103,"httpOnly":true,"secure":true,"session":false,"sameSite":"None","sameParty":false,"sourceScheme":"Secure","sourcePort":443},{"name":"uniqueuid","value":"642318101744707842","domain":"passport.yandex.ru","path":"/","expires":1779267841.109829,"size":27,"httpOnly":true,"secure":true,"session":false,"sameSite":"Lax","sameParty":false,"sourceScheme":"Secure","sourcePort":443}]'
  },


/*
  'account' : {
    'account_key' : '04643ec7cce3f2c69fac74bfc7486c9d',
    'user' : 'aslandenisenko',
    'password' : '.CqhGh2hjfq',
    'password_2fa' : 'OTPK3DCEBBJVFOJ6BCX6GVVCWQMQY',
    'phone' : '385917819175',
    'control_answer' : 'гиря'
  },
*/

/*
  'account' : {
    'account_key' : '04643ec7cce3f2c69fac74bfc7486c9d',
    'user' : 'mifuskenkel@yandex.ru',
    'password' : 'H5zcar4nMl',
    'phone' : '',
    'control_answer' : 'RTtm96TNF'
  },
*/

//miroslaw.sharapov@yandex.ru:ic4Patricia8rzA:vwvuieslibbrmkpo:243605018
/*
  'account' : {
    'account_key' : '04643ec7cce3f2c69fac74bfc7486c9d',
    'user' : 'miroslaw.sharapov@yandex.ru',
    'password' : 'ic4Patricia8rzA',
    //'password_2fa' : 'OTPOB76Y6IKEUALFIF3HZ5KWDMST2',
    'phone' : '243605018',
    'control_answer' : 'vwvuieslibbrmkpo'
  },
*/

  'task_id' : 1,
  'thread_id' : 1,

  'cookies_dir' : 'D:/'
};


var profilekey = 'test-frequency';

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
    //output = await seoa.handler( _post.handler );
    output = await seoa.handler( 'cookies-yandex' );
    //var auth_status = await yandex.auth( 'https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast', true );

    //await seoa.pageLoad( 'http://admin.serphunt/test.html', 'input' );
    //await seoa.fillTextInput( 'input', 'test' );

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

