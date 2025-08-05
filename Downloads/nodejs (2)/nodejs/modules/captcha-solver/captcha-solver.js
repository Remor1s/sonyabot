/**
 * Captcha Solver 1.0.0
 *
 * @package SerpHunt
 * @subpackage Core
 */

//const path = require('path');
const querystring = require('querystring');
const request = require('request-promise-native');
//const fetch = require('node-fetch'); #использовать Promise.resolve или Promise.all
//const fs = require('mz/fs');
const fs = require('fs');
const { noop, extend } = require('lodash');
//const delay = require('delay');
const { setTimeout } = require( 'node:timers/promises' );

class captchaSolver
{
  constructor()
  {
    this.comments = false;
    this.serviceErrors = {};
    this.errorPath = rootPath + '/tmp/' + serverName + '/captcha-errors';
    this.lastService = null;
    this.forceService = false;
    this.blockedServices = [];
    this.stats = [];

    this.captchaImage = '';

    if ( !fs.existsSync( this.errorPath ) )
    {
      fs.mkdirSync( this.errorPath, { recursive: true });
    }

    this.fatalErrors = {
      ERROR_ZERO_BALANCE: 'нулевой баланс',
      IP_BANNED: 'ip, с которого пришёл запрос заблокирован из-за частых обращений с различными неверными ключами. Блокировка снимается через час',
      ERROR_IP_BLOCKED: 'Доступ к api с этого ip запрещен из-за большого количества ошибок'
    };
  }


  /**
   * Запуск распознавания Captcha
   *
   * @param string|array captcha_type Тип капчи
   * @param string|array captcha_data Данные для распознования
   * @param array options Параметры распознавания
   *
   * @return string|boolean
   */
  async start( captcha_type, captcha_data, options )
  {
    var captcha_code = false;

    var services_options = seoaOptions[ 'captcha_solving' ][ 'services' ];

    options = extend(
      {
        rtimeout: 3,     //задержка в секундах между опросами статуса капчи
        mtimeout: 180,   //время ожидания ввода капчи в секундах
        comments: false, //включить/выключить комментирование происходящего
        phrase: 0,       //1 - в капче 2 и более слов
        regsense: 1,     //1 - регистр букв в капче имеет значение
        lang: 'ru',      //язык, который должен знать сотрудник, обрабатывающий капчу,
        jsonRequest: false
      },

      typeof options == 'undefined' ? {} : options
    );


    if ( options[ 'comments' ] == true )
    {
      this.comments = 1;
    }
    else
    {
      this.comments = 0;
    }


    if ( Object.keys( this.serviceErrors ).length < 1 )
    {
      var flist = fs.readdirSync( this.errorPath );
      for ( var i = 0; i < flist.length; i++ )
      {
        var service = flist[ i ];
        var stats = fs.statSync( this.errorPath + '/' + service );

        if ( ( new Date().getTime() - new Date( stats.mtime ).getTime() ) / 1000 < 60 )
        {
          this.serviceErrors[ service ] = 1;
        }
        else
        {
          fs.unlinkSync( this.errorPath + '/' + service );
        }
      }

      if ( Object.keys( this.serviceErrors ).length < 1 )
      {
        this.serviceErrors = { false: false };
      }
    }


    if ( typeof options[ 'source' ] != 'undefined' )
    {
      var status_key = 'status_' + options[ 'source' ];
    }
    else
    {
      options[ 'source' ] = null;
      var status_key = 'status';
    }



    let services_order = seoaOptions['captcha_solving'][ 'services_order' ];
    if ( this.forceService != false )
    {
      services_order = [ this.forceService ];
    }

/*
    if ( this.forceService != false )
    {
      for ( var i in services_order )
      {
        if ( services_order[ i ] == this.forceService )
        {
          delete services_order[ i ];

          if ( typeof services_order == 'object' )
          {
            services_order = Object.values( services_order );
          }

          services_order.unshift( this.forceService );
          break;
        }
      }
    }
*/


    var services_number = 0;
    for ( var i in services_order )
    {
      var service = services_order[ i ];

      if ( php.trim( seoaOptions[ 'captcha_solving' ][ 'services' ][ service ][ 'apikey' ] )
          && ( seoaOptions[ 'captcha_solving' ][ 'services' ][ service ][ status_key ] > 0 || this.forceService == service ) )
      {
        services_number ++;

        if ( php.inArray( service, this.blockedServices ) )
        {
          this.blockedServices = [];
          continue;
        }

        if ( service == 'capmonster' && typeof _post[ 'without_capmonster' ] != 'undefined' )
        {
          //continue;
        }

        if ( this.forceService && this.forceService != service )
        {
          //continue;
        }

        if ( service == 'rucaptcha.com' && typeof _post[ 'without_rucaptcha' ] != 'undefined' )
        {
          continue;
        }


        if ( typeof this.serviceErrors[ service ] == 'undefined' )
        {
          var solving_options = extend(
            seoaOptions[ 'captcha_solving' ][ 'services' ][ service ],
            options
          );

          solving_options[ 'service' ] = service;
          this.lastService = service;


          const si = this.stats.length;

          this.stats[ si ] = {
            'search_engine' : 'captcha:' + solving_options[ 'source' ],
            'task_action' : captcha_type,
            'handler' : service,
            'duration' : new Date().getTime()
          };


          solving_options[ 'captcha_type' ] = captcha_type;

          if ( captcha_type == 'image' )
          {
            var response = await this.image( captcha_data, solving_options );
          }
          else if ( captcha_type == 'slider' )
          {
            var response = await this.slider( captcha_data, solving_options );
          }
          else if ( captcha_type == 'recaptcha' )
          {
            var response = await this.recaptcha( captcha_data, solving_options );
          }
          else
          {
            console.log( 'не найден тип капчи' );
            services_number--;
            continue;
          }


//console.log( response );
//return 'cccc';
/*
        if ( service == 'server' )
        {
          if ( response.indexOf( 'coordinates:' ) > - 1 )
          {
            this.stats[ si ][ 'duration' ] = new Date().getTime() - this.stats[ si ][ 'duration' ];
            this.stats[ si ][ 'duration' ] = Math.round( this.stats[ si ][ 'duration' ] / 1000 );
            return response;
          }
          else
          {
            delete this.stats[ si ];

            console.log( '\n=============== captcha error ===============' );
            console.log( response );
            console.log( '=============== captcha error ===============\n' );

            services_number--;
            continue;
          }
        }
*/

//console.log( this.stats );

          let task_id = false;

          if ( typeof response == 'object' || isJSON( response ) )
          {
            if ( typeof response != 'object' )
            {
              response = JSON.parse( response );
            }

            if ( typeof response[ 'task_id' ] != 'undefined' ) // server
            {
              task_id = response[ 'task_id' ];
              solving_options[ 'jsonRequest' ] = true;
            }
            else if ( typeof response[ 'taskId' ] != 'undefined' )
            {
              task_id = response[ 'taskId' ];
              solving_options[ 'jsonRequest' ] = true;
            }
            else if ( php.inArray( service, [ 'capsola.cloud' ] ) && response[ 'status' ] )
            {
              task_id = response[ 'response' ];
              solving_options[ 'jsonRequest' ] = true;
            }
            else if ( typeof response[ 'request' ] != 'undefined' )
            {
              task_id = response[ 'request' ];

              if ( php.inArray( service, [ 'white-captcha.com' ] ) )
              {
                solving_options[ 'jsonRequest' ] = true;
              }
              else
              {
                solving_options[ 'jsonRequest' ] = false;
              }
            }
            else
            {
              delete this.stats[ si ];

              console.log( '\n=============== captcha error ===============' );
              console.log( response );
              //console.log( options );
              console.log( '=============== captcha error ===============\n' );

              services_number--;
              continue;
            }
          }
          else
          {
            delete this.stats[ si ];

            console.log( '\n=============== captcha error ===============' );
            console.log( response );
            //console.log( options );
            console.log( '=============== captcha error ===============\n' );

            services_number--;
            continue;
          }


          if ( typeof response[ 'status' ] != 'undefined' )
          {
            if ( response[ 'status' ] < 1 )
            {
              delete this.stats[ si ];

              console.log( '\n=============== captcha error ===============' );
              console.log( response );
              //console.log( options );
              console.log( '=============== captcha error ===============\n' );

							if ( service == 'rucaptcha.com'
										&& typeof response[ 'request' ] != 'undefined'
										//&& php.inArray( response[ 'request' ], [ 'ERROR_NO_SLOT_AVAILABLE', 'ERROR_ZERO_BALANCE' ] ) )
                    && php.inArray( response[ 'request' ], [ 'ERROR_ZERO_BALANCE' ] ) )
							{
								fs.writeFileSync( rootPath + '/tmp/' + serverName + '/control/rucaptcha-stop', '1' );
							}

              services_number--;
              continue;
            }
          }
          else if ( typeof response[ 'errorId' ] != 'undefined' )
          {
            if ( response[ 'errorId' ] > 0 )
            {
              delete this.stats[ si ];

              console.log( '\n=============== captcha error ===============' );

              if ( response[ 'errorDescription' ].trim() )
              {
                console.log( response[ 'errorDescription' ] );
              }
              else
              {
                console.log( response[ 'errorCode' ] );
              }

              console.log( '=============== captcha error ===============\n' );

              services_number--;
              continue;
            }
          }


//console.log( service + ' : ' + task_id ); //temp

          if ( /^\d+$/.test( task_id ) || php.inArray( service, [ 'capsola.cloud', 'white-captcha.com', 'server' ] ) )
          {
            var captcha_code = await this.getAnswer( task_id, solving_options );

            if ( php.inArray( service, this.blockedServices ) )
            {
              return false;
            }

            this.stats[ si ][ 'duration' ] = new Date().getTime() - this.stats[ si ][ 'duration' ];
            this.stats[ si ][ 'duration' ] = Math.round( this.stats[ si ][ 'duration' ] / 1000 );
            //fs.writeFileSync( rootPath + '/captcha-duration.txt', this.stats[ si ][ 'duration' ] + '\n', { 'flag' : 'a+' } );

            if ( php.trim( captcha_code ) )
            {
              if ( typeof captcha_code[ 'errorCode' ] != 'undefined' && php.trim( captcha_code[ 'errorCode' ] ) )
              {
                let error = captcha_code[ 'errorCode' ];

                if ( typeof this.fatalErrors[ captcha_code[ 'errorCode' ] ] != 'undefined' )
                {
                  error = service + ': ' + this.fatalErrors[ captcha_code[ 'errorCode' ] ];
                  fs.writeFileSync( this.errorPath + '/' + service, error );
                  this.serviceErrors[ service ] = 1;
                }

                console.log( '\n=============== captcha error ===============' );
                console.log( error );
                console.log( '=============== captcha error ===============\n' );

                services_number--;
                continue;
              }
              else if ( typeof captcha_code[ 'errorDescription' ] != 'undefined' && php.trim( captcha_code[ 'errorDescription' ] ) )
              {
                let error = captcha_code[ 'errorDescription' ];

                if ( typeof this.fatalErrors[ captcha_code[ 'errorDescription' ] ] != 'undefined' )
                {
                  error = service + ': ' + this.fatalErrors[ captcha_code[ 'errorDescription' ] ];
                  fs.writeFileSync( this.errorPath + '/' + service, error );
                  this.serviceErrors[ service ] = 1;
                }

                console.log( '\n=============== captcha error ===============' );
                console.log( error );
                console.log( '=============== captcha error ===============\n' );

                services_number--;
                continue;
              }
              else if ( typeof captcha_code == 'string' && /ERROR/i.test( captcha_code ) )
              {
                if ( captcha_code.indexOf( 'ERROR_PROXY_BANNED' ) > -1 && service != 'rucaptcha.com' )
                {
                  console.log( '\n=============== captcha error ===============' );
                  console.log( 'ERROR_PROXY_BANNED' );
                  console.log( '=============== captcha error ===============\n' );

                  return false;
                  //this.forceService = 'rucaptcha.com';
                }

                console.log( '\n=============== captcha error ===============' );
                console.log( captcha_code );
                console.log( '=============== captcha error ===============\n' );

                services_number--;
                continue;
              }
              else
              {
                return captcha_code;
              }
            }
          }
          else if ( typeof this.fatalErrors[ task_id ] != 'undefined' )
          {
            let fatal_error = service + ': ' + this.fatalErrors[ task_id ];
            fs.writeFileSync( this.errorPath + '/' + service, fatal_error );
            this.serviceErrors[ service ] = 1;

            console.log( '\n=============== captcha error ===============' );
            console.log( fatal_error );
            console.log( '=============== captcha error ===============\n' );

            services_number --;
          }
          else
          {
            console.log( '\n=============== captcha error ===============' );
            console.log( service + ': ' + task_id );
            console.log( '=============== captcha error ===============\n' );

            services_number --;
          }
        }
        else
        {
          services_number --;
        }
      }
    }

    //if ( typeof options[ 'yandex_advanced_captcha' ] == 'undefined' && services_number < 1 )
    if ( options[ 'source' ] == 'yandex_advanced' && services_number < 1 )
    {
      console.log('/******************* captcha numbers start ******************* /');
      console.log( JSON.stringify( captchaNumbers ) );
      console.log('/******************** captcha numbers end ******************** /');

      if ( browser != null )
      {
        browser.close();
      }

      process.exit();
    }
  }




  /**
   * Отсылка данных рекапчи для распознования
   *
   * @param string captcha_data Данные полей рекапчи
   * @param array solving_options Параметры распознавания
   *
   * @return string|boolean
   */
  async recaptcha( captcha_data, solving_options )
  {
    try
    {
      if ( /^https?\%3A\%2F\%2/.test( captcha_data.pageurl ) )
      {
         captcha_data[ 'pageurl' ] = decodeURIComponent(  captcha_data[ 'pageurl' ] );
      }

      if ( _post[ 'proxy' ] != undefined && _post[ 'proxy' ][ 'ip' ] != undefined )
      {
        _post[ 'proxy' ][ 'type' ] = _post[ 'proxy' ][ 'type' ].replace( '/https', '' );
        _post[ 'proxy' ][ 'type' ] = _post[ 'proxy' ][ 'type' ].toUpperCase();
      }

      if ( php.inArray( solving_options[ 'service' ], [ 'anti-captcha.com', 'captcha.guru', 'capmonster.cloud', 'capmonster' ] ) )
      {
        let request_data = {
          clientKey: solving_options[ 'apikey' ],
          task: {
            type: 'NoCaptchaTaskProxyless',
            websiteKey: captcha_data[ 'googlekey' ],
            websiteURL: captcha_data[ 'pageurl' ],
            recaptchaDataSValue: captcha_data[ 's' ]
            //dataS: captcha_data[ 's' ]
          },
          softId: 0,
          languagePool: 'en'
        }

        if ( _post[ 'proxy' ] != undefined && _post[ 'proxy' ][ 'ip' ] != undefined
              && !php.inArray( solving_options[ 'service' ], [ 'capmonster.cloud' ] ) )
        {
          request_data[ 'task' ][ 'type' ] = 'NoCaptchaTask';
          request_data[ 'task' ][ 'proxyType' ] = _post[ 'proxy' ][ 'type' ];
          request_data[ 'task' ][ 'proxyAddress' ] = _post[ 'proxy' ][ 'ip' ];
          request_data[ 'task' ][ 'proxyPort' ] = _post[ 'proxy' ][ 'port' ];
          request_data[ 'task' ][ 'proxyLogin' ] = _post[ 'proxy' ][ 'userpwd' ].replace( /^([^:]+)\:([^:]+)$/, '$1' );
          request_data[ 'task' ][ 'proxyPassword' ] = _post[ 'proxy' ][ 'userpwd' ].replace( /^([^:]+)\:([^:]+)$/, '$2' );
        }

        if ( php.inArray( solving_options[ 'service' ], [ 'capmonster.cloud', 'capmonster' ] ) )
        {
          request_data[ 'task' ][ 'nocache' ] = 1;
        }

        if ( typeof captcha_data[ 'cookies' ] != 'undefined' )
        {
          request_data[ 'task' ][ 'cookies' ] = captcha_data[ 'cookies' ];
        }

        if ( typeof captcha_data[ 'useragent' ] != 'undefined' )
        {
          request_data[ 'task' ][ 'userAgent' ] = captcha_data[ 'useragent' ];
        }

        return await this.jsonPostRequest( 'http://' + solving_options[ 'domain' ] + '/createTask', request_data );
      }
      else
      {
        var task_url =
          'http://' + solving_options[ 'domain' ] + '/in.php'
            + '?method=userrecaptcha'
            + '&json=1'
            + '&key=' + solving_options[ 'apikey' ]
            + '&googlekey=' + captcha_data[ 'googlekey' ]
            + '&pageurl=' + encodeURIComponent( captcha_data[ 'pageurl' ] )
            + '&data-s=' + captcha_data[ 's' ];
            + '&datas=' + captcha_data[ 's' ];

        if ( false && _post.proxy != undefined && _post.proxy['ip'] != undefined )
        {
          task_url +=
            '&proxytype=' + _post.proxy['type'].toUpperCase()
            + '&proxy=' +  _post.proxy['userpwd'] + '@' +  _post.proxy['ip'] + ':' +  _post.proxy['port'];
        }

//console.log( task_url );

        if ( typeof captcha_data[ 'cookies' ] != 'undefined' )
        {
          task_url += '&cookies=' + encodeURIComponent( captcha_data[ 'cookies' ] );
        }

        if ( typeof captcha_data[ 'useragent' ] != 'undefined' )
        {
          task_url += '&userAgent=' + encodeURIComponent( captcha_data[ 'useragent' ] );
        }

//console.log( task_url );

        return await request.post({ url: task_url });
      }
    }
    catch ( e )
    {
      throw e;
    }
  }


  /**
   * Отсылка slider капчи для распознования
   *
   * @param string captcha_data Данные капчи
   * @param array $solving_options Настройки сервиса распознования
   *
   * @return string|boolean
   */
  async slider( captcha_data, solving_options )
  {
    if ( php.inArray( solving_options[ 'service' ], [ 'captcha.guru' ] ) )
    {
      let request_data = {
        'method' : 'base64',
        'key' : solving_options[ 'apikey' ],
        'click' : 'oth2',
        'textinstructions' : 'puzzlekal',
        'json' : 1
      };

      const response = await request.post({
        url: 'http://' + solving_options[ 'domain' ] + '/in.php?' + querystring.stringify( request_data ),
        form: { body : captcha_data }
      });

      return response;
    }
    else
    {
      return false;
    }
  }



  /**
   * Отсылка графической капчи для распознования
   *
   * @param string $image_url URL изображения Captcha
   * @param array $solving_options Настройки сервиса распознования
   *
   * @return string|boolean
   */
  async image( image_url, solving_options )
  {

//console.log(  solving_options[ 'service' ] );

    /**
     * Считываение файла изображения в буфер
     */
    try
    {
      try
      {
        if ( typeof image_url != 'object' )
        {
          if ( /^base64:/.test( image_url ) )
          {
            var image = image_url.replace( /^base64:/, '' );
          }
          else
          {
            if ( /^(http|https)/.test( image_url ) )
            {
              var image = await request.get({ url: image_url, encoding: null });
            }
            else
            {
              var image = await fs.readFile( image_url );
            }

            image = image.toString( 'base64' );
this.captchaImage = image;
          }
        }
//console.log( image_url );
//return false;
//this.captchaImage = image_url;

        try
        {
          const headers = {};

          if ( solving_options[ 'service' ] == 'server' )
          {
            const request_data = {
              'captcha' : image_url[ 'captcha' ],
              'task' : image_url[ 'task' ]
            };

            //solving_options[ 'domain' ] = 'tasks.serphunt';

            const response = await this.jsonPostRequest(
              'http://' + solving_options[ 'domain' ] + '/create-task.php',
              //'http://' + solving_options[ 'domain' ] + '/_captcha-solver/create-task.php',
              request_data,
              { 'Apikey' : solving_options[ 'apikey' ] }
            );

//console.log( response );

            return response;
          }
          else if ( php.inArray( solving_options[ 'service' ], [ 'capsola.cloud' ] ) )
          {
            const request_data = {
              //'app_id' : solving_options[ 'apikey' ],
              'type': 'SmartCaptcha',
              'click' : image_url[ 'captcha' ],
              'task' : image_url[ 'task' ]
            };

//console.log( request_data );
//return false;

            return await this.jsonPostRequest(
              'https://' + solving_options[ 'domain' ] + '/create',
              request_data,
              { 'X-API-Key' : solving_options[ 'apikey' ] }
            );

            //return await this.jsonPostRequest( 'http://admin.serphunt/test.php', request_data );
          }
          else if ( php.inArray( solving_options[ 'service' ], [ 'white-captcha.com' ] ) )
          {
            const request_data = {
              'key' : solving_options[ 'apikey' ],
              'format' : 'base64',
              //'body' : image_url[ 'captcha' ], //body0
              //'imginstructions' : image_url[ 'task' ], //body1
              'body0' : image_url[ 'captcha' ],
              'body1' : image_url[ 'task' ],
              'json' : 1,
              'click' : image_url[ 'captcha' ],
            };

//console.log( request_data ); return false;

            return await this.jsonPostRequest(
              'http://' + solving_options[ 'domain' ] + '/in.php',
              request_data
            );

            //return await this.jsonPostRequest( 'http://admin.serphunt/test.php', request_data );
          }
          else if ( php.inArray( solving_options[ 'service' ], [ 'anti-captcha.com', 'capmonster.cloud', 'capmonster' ] ) ) //'captcha.guru',
          {
            let request_data = {
              clientKey: solving_options[ 'apikey' ],
              task: {
                type: 'ImageToTextTask',
                body: image,
                phrase: solving_options[ 'phrase' ],
                'case': solving_options['regsense'],
                numeric: false,
                math: 0,
                minLength: 0,
                maxLength: 0
              },
              softId: 0,
              languagePool: 'en'
            }


            if ( php.inArray( solving_options[ 'service' ], [ 'capmonster.cloud', 'capmonster' ] ) && solving_options[ 'source' ] == 'yandex' )
            {
              if ( typeof solving_options[ 'oneword' ] != 'undefined' )
              {
                request_data[ 'task' ][ 'CapMonsterModule' ] = 'yandex';
              }
              else
              {
                //request_data[ 'task' ][ 'CapMonsterModule' ] = 'yandexnew';
                request_data[ 'task' ][ 'CapMonsterModule' ] = 'yandexwave';
              }

              if ( solving_options[ 'service' ] == 'capmonster' )
              {
                request_data[ 'task' ][ 'CapMonsterModule' ] = 'ZennoLab.' + request_data[ 'task' ][ 'CapMonsterModule' ];
              }
            }

            if ( solving_options[ 'service' ] == 'anti-captcha.com' && typeof solving_options[ 'lang' ] != 'undefined' )
            {
              request_data[ 'languagePool' ] = ( solving_options[ 'lang' ] == 'en' ) ? 'en' : 'rn';
            }

            return await this.jsonPostRequest( 'http://' + solving_options[ 'domain' ] + '/createTask', request_data );
          }
          else
          {
            let request_data = {
              method: 'base64',
              key: solving_options[ 'apikey' ],
              phrase: solving_options[ 'phrase' ],
              regsense: solving_options['regsense'],
              json: 1
            };

            //if ( typeof solving_options[ 'yandex_advanced_captcha' ] != 'undefined' )
            if ( solving_options[ 'source' ] == 'yandex_advanced' )
            {
              if ( solving_options[ 'service' ] == 'captcha.guru' )
              {
                request_data[ 'click' ] = 'oth';
                request_data[ 'textinstructions' ] = 'yandex';
              }
            }
            else if ( solving_options[ 'source' ] == 'yandex' && solving_options[ 'service' ] == 'xevil' )
            {
              request_data[ 'corename' ] = 'Yandex2024';
            }


            if ( typeof solving_options[ 'lang' ] != 'undefined' )
            {
              request_data[ 'lang' ] = solving_options[ 'lang' ];
            }


//console.log( request_data );
//console.log( image );

            const response = await request.post({
              url: 'http://' + solving_options[ 'domain' ] + '/in.php?' + querystring.stringify( request_data ),
              form: { body : image }
            });

            return response;
          }
        }
        catch ( e )
        {
          throw e;
        }
      }
      catch (e)
      {
        throw e;
      }
    }
    catch ( e )
    {
      throw e;
    }
  }



  /**
   * Получение результата расспознования
   *
   * @param integer task_id Идентификатор задания на распознование
   * @param array solving_options Настройки сервиса распознования
   *
   * @return string|boolean
   */
  async getAnswer( task_id, solving_options )
  {
    try
    {
      var waittime = 0;

      if ( solving_options[ 'captcha_type' ] == 'recaptcha' )
      {
        solving_options[ 'rtimeout' ] = 3;
      }
      else if ( php.inArray( solving_options[ 'service' ], [ 'capsola.cloud', 'white-captcha.com', 'captcha.guru', 'capmonster.cloud', 'capmonster', 'xevil' ] ) )
      {
        solving_options[ 'rtimeout' ] = 0.5;
      }
      else if ( php.inArray( solving_options[ 'service' ], [ 'server' ] ) )
      {
        solving_options[ 'rtimeout' ] = 0.05; //0.052;
      }
      else
      {
        solving_options[ 'rtimeout' ] = 3;
      }



      if ( php.inArray( solving_options[ 'service' ], [ 'xevil' ] ) && solving_options[ 'captcha_type' ] != 'recaptcha' )
      {
        solving_options['mtimeout'] = 5;
      }
      else if ( php.inArray( solving_options[ 'service' ], [ 'server' ] ) )
      {
        //solving_options['mtimeout'] = 5;
        solving_options['mtimeout'] = 3;
        //solving_options['mtimeout'] = 40;
      }


      if ( this.comments )
      {
        console.log( 'waiting for ' + solving_options['rtimeout'] + ' seconds' );
      }


      while( true )
      {
        await setTimeout( solving_options[ 'rtimeout' ] * 1000 );

        let response = null;
        if ( solving_options[ 'jsonRequest' ] )
        {
          if ( solving_options[ 'service' ] == 'server' )
          {
            //solving_options[ 'domain' ] = 'tasks.serphunt';

            try
            {
              response = await request.get({ 'url' :  'http://' + solving_options[ 'domain' ] + '/tasks/results/' + task_id });
              response = response.trim();
/*
              response = await this.jsonPostRequest(
                'http://' + solving_options[ 'domain' ] + '/get-result.php',
                //'http://' + solving_options[ 'domain' ] + '/_captcha-solver/get-result.php',
                { 'task_id' : task_id },
                { 'Apikey' : solving_options[ 'apikey' ] }
              );
*/
            }
            catch ( error )
            {
              error = error.toString();
              response = error.trim();
            }



            if ( response.indexOf( 'coordinates:' ) > -1 )
            {
/*
              if (  response.indexOf( 'coordinates:' ) < 0 )
              {
                response = { 'solution' : response };
              }
*/
              response = { 'solution' : response };
            }
            else if ( response.indexOf( 'ERROR:' ) > -1 )
            {
              if ( seoaOptions[ 'captcha_solving' ][ 'services' ][ 'captcha.guru' ][ 'status_yandex_advanced' ] > 0 ||
                  seoaOptions[ 'captcha_solving' ][ 'services' ][ 'capsola.cloud' ][ 'status_yandex_advanced' ] > 0 )
              {
                //console.log( solving_options[ 'service' ] + ': ' + response ); //дублирует вывод ошибки
                this.blockedServices.push( solving_options[ 'service' ] );
              }

              response = { 'error' : response };
            }
            else
            {
              //console.log( response );
              response = {};
            }
          }
          else if ( solving_options[ 'service' ] == 'capsola.cloud' )
          {
            response = await this.jsonPostRequest(
              'https://' + solving_options[ 'domain' ] + '/result',
              { 'id' : task_id },
              { 'X-API-Key' : solving_options[ 'apikey' ] }
            );
          }
          else if ( solving_options[ 'service' ] == 'white-captcha.com' )
          {
            response = await this.jsonPostRequest(
              'http://' + solving_options[ 'domain' ] + '/res.php',
              {
                'key' : solving_options[ 'apikey' ],
                'get_coordinates' : 'string',
                'json' : 1,
                'id' : task_id
              }
            );
          }
          else
          {
            response = await this.jsonPostRequest(
              'http://' + solving_options[ 'domain' ] + '/getTaskResult',
              {
                'clientKey' : solving_options[ 'apikey' ],
                'taskId' : task_id
              }
            );
          }
        }
        else
        {
          try
          {
            var geturl =
              'http://' + solving_options[ 'domain' ] + '/res.php'
                + '?action=get'
                + '&json=1'
                + '&key=' + solving_options['apikey']
                + '&id=' + task_id;

            response = await request.get({ url : geturl });
          }
          catch ( error )
          {
            error = error.toString();
            response = error.trim();

            console.log( response );

            //StatusCodeError: 500 - "XEVIL INTERNAL ERROR: PROBABLY, INCORRECT REQUEST"
            if ( response.indexOf( 'StatusCodeError: 500' ) > -1 )
            {

//fs.writeFileSync( rootPath + '/_errors/xevil/base64/' + md5( this.captchaImage ) + '.base64', this.captchaImage );

              return 'xxx'; //перезагрузка страницы с капчей
            }
            else
            {
              return false;
            }
          }
        }

//response = iconv.decode( response, 'win1251');
//response  = iconv.decode( response, 'UTF-8');

        if ( typeof response != 'object' )
        {
          response = JSON.parse( response );
        }



//console.log( response );



        if ( typeof response[ 'errorCode' ] != 'undefined' && php.trim( response[ 'errorCode' ] ) )
        {
          return response[ 'errorCode' ];
        }


        if (  solving_options[ 'service' ] == 'server' )
        {
          if ( typeof response[ 'solution' ] != 'undefined' )
          {
            return response[ 'solution' ];
          }
          else if ( typeof response[ 'error' ] != 'undefined' )
          {
            if ( seoaOptions[ 'captcha_solving' ][ 'services' ][ 'captcha.guru' ][ 'status_yandex_advanced' ] > 0 ||
                seoaOptions[ 'captcha_solving' ][ 'services' ][ 'capsola.cloud' ][ 'status_yandex_advanced' ] > 0 )
            {
              this.blockedServices.push( solving_options[ 'service' ] );
            }

            console.log( solving_options[ 'service' ] + ': ' + response[ 'error' ] );
            return false;
          }
        }
        else if ( solving_options[ 'service' ] == 'capsola.cloud' )
        {
          if ( response[ 'status' ] )
          {
            return response[ 'response' ];
          }
          else if ( response[ 'response' ].indexOf( 'ERROR_CAPTCHA_UNSOLVABLE' ) > -1 )
          {
            console.log( solving_options[ 'service' ] + ': ERROR_CAPTCHA_UNSOLVABLE' );
            return false;
          }
          else if ( response[ 'response' ].indexOf( 'CAPCHA_NOT_AVAILABLE' ) > -1 )
          {
            console.log( solving_options[ 'service' ] + ': CAPCHA_NOT_AVAILABLE' );
            return false;
          }
          else if ( !php.inArray( response[ 'response' ], [ 'CAPCHA_NOT_READY', 'CAPTCHA_NOT_READY' ] ) )
          {
            return 'ERROR: ' + response[ 'response' ];
          }
        }
        else if ( typeof response[ 'request' ] != 'undefined' )
        {
          if ( typeof response[ 'cookies' ] != 'undefined' )
          {
            let cookies = [];

            for ( let cookie_name in response[ 'cookies' ] )
            {
              if ( cookie_name.trim() && response[ 'cookies' ][ cookie_name ].trim() )
              {
                await page.setCookie({
                  'name' : cookie_name,
                  'value' : response[ 'cookies' ][ cookie_name ]
                });
              }
            }
          }


//console.log( response );

          if ( response[ 'status' ] === 'ready' )
          {
            return response[ 'solution' ][ 'response' ];
          }
          else if ( response[ 'status' ] > 0 && !php.inArray( response[ 'request' ], [ 'CAPCHA_NOT_READY', 'CAPTCHA_NOT_READY' ] ) )
          {
            return response[ 'request' ];
          }
          else if ( response[ 'request' ].indexOf( 'ERROR_CAPTCHA_UNSOLVABLE' ) > -1 )
          {

if ( solving_options[ 'service' ] == 'captcha.guru' )
{
  //fs.writeFileSync( rootPath + '/_errors/captcha.guru/base64/' + md5( this.captchaImage ) + '.base64', this.captchaImage );
}

            console.log( solving_options[ 'service' ] + ': ERROR_CAPTCHA_UNSOLVABLE' );
            return false;
          }
          else if ( response[ 'request' ].indexOf( 'CAPCHA_NOT_AVAILABLE' ) > -1 )
          {
            console.log( solving_options[ 'service' ] + ': CAPCHA_NOT_AVAILABLE' );
            return false;
          }
          else if ( response[ 'request' ].indexOf( 'ERROR' ) > -1 )
          {
            return response[ 'request' ];
          }
        }
        else
        {
          if ( typeof response[ 'errorId' ] != 'undefined' && response[ 'errorId' ] > 0 )
          {
            return response;
          }

          if ( response[ 'status' ] === 'ready' )
          {
            if ( typeof response[ 'solution' ][ 'text' ] != 'undefined' )
            {
              return response[ 'solution' ][ 'text' ];
            }
            else if ( typeof response[ 'solution' ][ 'gRecaptchaResponse' ] != 'undefined' )
            {
              return response[ 'solution' ][ 'gRecaptchaResponse' ];
            }
            else
            {
              return response[ 'solution' ];
            }
          }
        }



        waittime += solving_options[ 'rtimeout' ] * 1000;

        if ( waittime > solving_options['mtimeout'] * 1000 )
        {
          if ( this.comments )
          {
            console.log( 'timelimit (' + solving_options['mtimeout'] + ') hit' );
          }

          break;
        }

        if ( this.comments )
        {
          console.log( 'waiting for ' + solving_options['rtimeout'] + ' seconds' );
        }
//console.log( 'waiting for ' + solving_options['rtimeout'] + ' seconds' );
        await seoa.updateTaskExecutionTime();
      }
    }
    catch ( error )
    {
      throw error;
    }

    return false;
  }


  async jsonPostRequest( url, data, headers )
  {
    if ( typeof headers == 'undefined' )
    {
      headers = { 'Content-Type': 'application/json' };
    }
    else
    {
      headers[ 'Content-Type' ] = 'application/json';
    }

    return await request.post({
      url: url,
      body: JSON.stringify( data ),
      'headers': headers,
      'Content-Type': 'application/json'
    });


/*
    let response = await fetch(
      url,
      {
        method: 'post',
        body: JSON.stringify( data ),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    response = await response.json();
    return response;
*/
  }
}

module.exports = captchaSolver;

