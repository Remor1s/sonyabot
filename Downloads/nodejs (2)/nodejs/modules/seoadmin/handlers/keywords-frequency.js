/**
 * Проверка частотности ключевых слов
 *
 * @package SerpHunt
 * @subpackage Core
 */

async function sendRequest( keywords_group, captchaYandexId, captchaCode )
{
  if ( typeof captchaYandexId == 'undefined' )
  {
    captchaYandexId = null;
  }

  if ( typeof captchaCode == 'undefined' )
  {
    captchaCode = null;
  }


  await page.evaluate( ( keywords, region_id, captchaYandexId, captchaCode ) => {
    const form_action = document.querySelector( 'form[name="ad"]' ).action;

    let postdatalist = {
      advanced_forecast : 'yes',
      cmd : 'ajaxDataForNewBudgetForecast',
      csrf_token : form_action.replace( /^.*\/main\.(.+?)\.pl.*$/, '$1'),
      currency : 'RUB',
      fixate_stopwords : 1,
      geo : region_id,
      minusWords : '',
      period : 'month',
      period_num : 0,
      phrases : keywords,
      unglue : 0
    };

    if ( captchaYandexId !== null && captchaCode !== null )
    {
      postdatalist[ 'captcha_id' ] = captchaYandexId;
      postdatalist[ 'captcha_code' ] = captchaCode;
    }


    let postdata = [];
    for ( let k in postdatalist )
    {
      postdata.push( k + '=' + postdatalist[ k ] );
    }
    postdata = postdata.join( '&' );


    if ( typeof unixhr === 'undefined' )
    {
      var unixhr = new XMLHttpRequest();
    }

    unixhr.onreadystatechange = function() {
      if ( unixhr.readyState == 4 && ( unixhr.status == 200 || unixhr.response.indexOf( 'captcha' ) > - 1 ) )
      {
        let response = unixhr.response;

        if ( typeof response == 'object' )
        {
          response = JSON.stringify( response );
        }

        let $result_container = document.getElementById( 'seoa-result' );
        if ( $result_container === null )
        {
          const textarea = document.createElement( 'textarea' );
          textarea.id = 'seoa-result';
          textarea.name = 'seoa_result';
          textarea.style.width = '1000px';
          textarea.style.height = '400px';
          document.body.appendChild( textarea );

          $result_container = document.getElementById( 'seoa-result' );
        }

        $result_container.value = response;
      }
    };


    unixhr.open( 'POST', form_action, true );
    unixhr.setRequestHeader( 'Accept', 'application/json, text/javascript, */*; q=0.01' );
    unixhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8' );
    unixhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
    unixhr.send( postdata );
  }, _post.keyword_groups[ keywords_group ], _post.region_id, captchaYandexId, captchaCode );
}

async function keywordsFrequency()
{
  let error = 'ошибка обработки страницы при парсинге частотностей';
  let output = {};

  let start_time = new Date().getTime();
  captchaSolver.stats = [];


  if ( _post.account != undefined && _post.account.user != undefined && _post.account.password != undefined )
  {
    console.log( 'account - ' + _post.account.user + ':' + _post.account.password );


    /**
     * Авторизация в Яндекс Директ
     */
    //var auth_status = await yandex.auth( 'https://direct.yandex.ru/', true );
    var auth_status = await yandex.auth( 'https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast', true );

    let pi = 0
    while ( await page.url().indexOf( 'direct.yandex.ru/registered/main.pl?cmd=advancedForecast' ) < 0 && pi <= 50 )
    {
      await page.waitForTimeout( 100 );
      pi++;
    }

/*
    output[ 'parsing_stats' ][ 'auth_duration' ] = Math.round( ( new Date().getTime() - start_time ) / 1000 );
    output[ 'parsing_stats' ][ 'auth_captchas' ] = captchaSolver.stats.length;

    start_time = new Date().getTime();
    captchaSolver.stats = [];
*/

    if ( auth_status !== true )
    {
      return auth_status;
      //return output;
    }

    /**
     * Переход на страницу с формой поиска ключевых слов
     *
    if ( !await seoa.pageLoad( 'https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast', '#footer, .footer' ) )
    {
      return false;
    }
    */


    /**
     * Проверка на необходмость ввода телефона
     */
    await yandex.checkPhoneControlInput();

    /**
     * Проверка на необходмость ввода дополнительного email
     */
    await yandex.checkAdditionalEmailInput();

    /**
     * Проверка на капчу
     */
    await yandex.checkCaptcha( true );

    var captcha_reloaded = false;

    let t1 = new Date().getTime();
    let t2 = t1;
    while ( t2 - t1 < 10000 )
    {
      form_exists = await page.evaluate( () => {
        if ( document.querySelector( 'form[name="ad"]' ) !== null )
        {
          return true;
        }
      });

      if ( form_exists )
      {
        break;
      }
      else
      {
        /**
         * Проверка на подтверждения телефона по SMS
         */

        const account_blocked = await yandex.checkAccountBlock();

        if ( account_blocked )
        {
          return account_blocked;
        }
        else if ( !captcha_reloaded )
        {
          if ( page.$( yandex.captchaImageSelector ) !== null )
          {
            captcha_reloaded = true;

            if ( await yandex.checkCaptcha( true ) === 'stop' )
            {
              return { 'error' : 'превышено количество попыток распознать капчу при авторизации в аккаунт яндекса' };
            }
          }

          await page.waitForTimeout( 3500 );
          t2 = new Date().getTime();
        }
        else if ( !/^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
        {

          return { 'error' : 'не найдена форма для проверки частотностей' };
        }
      }
    }


    if ( !/^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
    {
      return { 'error' : 'не найдена форма для проверки частотностей' };
    }


    /**
     * Поиск капчи в ajax запросах
     */
    var captcha_reloaded = false;


    var groupsLength = Object.keys( _post.keyword_groups ).length;
    var groupIndex = 1;

    keywordsCycle:
    for ( var kg in _post.keyword_groups )
    {
      /**
       * Обновление контрольного времени выполнения задания
       */
      await seoa.updateTaskExecutionTime( 'yandex' );

      /**
       * Отсылка ключевых слова на проверку частотности
       */
      await sendRequest( kg );

      t1 = new Date().getTime();

      /**
       * Ожидание ajax ответа
       */
      for ( var i = 0; i <= 30; i ++ )
      {
        t2 = new Date().getTime();
        if ( t2 - t1 > 20000 )
        {
          error = 'время ожидания истекло ' + _post.account.user + ':' + _post.account.password;
          break keywordsCycle;
        }

        await page.waitForTimeout( 3500 );


        /**
         * Запись ajax ответа в массив данных для анализа
         */
        ajax_result = await page.evaluate( () => {
          let $result_container = document.getElementById( 'seoa-result' );
          if ( $result_container !== null )
          {
            const ajax_result = $result_container.value;
            //$result_container.value = '';
            $result_container.remove();

            if ( ajax_result.trim() )
            {
              return ajax_result;
            }
            else
            {
              return null;
            }
          }
          else
          {
            return null;
          }
        });


        if ( ajax_result !== null )
        {
          if ( ajax_result.indexOf( 'captcha' ) > -1 )
          {
            /**
             * Распознавание капчи и повторная отсылка задания
             */
            captchaNumbers.parsing += 1;

            if ( captchaNumbers.parsing >= 6 )
            {
              error = 'выдает много капч для аккаунта ' + _post.account.user + ':' + _post.account.password;
              break keywordsCycle;
            }

            let yandexCaptchaJson = await JSON.parse( ajax_result );

            const captchaCode = await captchaSolver.start(
              'image',
              yandexCaptchaJson.captcha_url,
              {
                source: 'yandex',
                oneword: true
              }
            );

            if ( typeof captchaCode != 'undefined' && await php.trim( captchaCode ) )
            {
              t1 = new Date().getTime();

              sendRequest( kg, yandexCaptchaJson.captcha_id, captchaCode );
              await page.waitForTimeout( 5000 );
            }
            else
            {
              break;
            }
          }
          else
          {
            t1 = new Date().getTime();

            //captcha_reloaded = false;
            //output[ kg ] = encodeURIComponent( ajax_result );
            output[ kg ] = ajax_result;

            break;
          }
        }
        else
        {
          let submit_error = await page.evaluate( ( captcha_reloaded ) => {
            if ( document.querySelector( '.js-error-message' ) !== null )
            {
              const error = document.querySelector( '.js-error-message' ).innerText;
              if ( error.indexOf( 'расчет еще раз' ) > -1 )
              {
                const selector = '.b-ajax-captcha__form .b-form-button__input';
                if ( !captcha_reloaded && document.querySelector( selector ) !== null )
                {
                  document.querySelector( selector ).click();
                  //return 'xxx';
                }
                else
                {
                  return error;
                }
              }
              else
              {
                //return error;
              }
            }
          }, captcha_reloaded );

          if ( submit_error )
          {
            if ( submit_error.indexOf( 'расчет еще раз' ) > -1 )
            {
              await sendRequest( kg );
            }
            else if ( !captcha_reloaded )
            {
              await page.waitForTimeout( 2000 );

              captcha_reloaded = true;
              t1 = new Date().getTime();
            }
            else
            {
              //error = 'превышено количество попыток распознать капчу';
              error = submit_error;
              break keywordsCycle;
            }
          }
        }
      }


      if ( groupIndex != groupsLength )
      {
        await seoa.delay( 'yandex_direct' );
      }

      groupIndex++;
    }
  }

  if ( Object.keys( output ) < 1 )
  {
    return { 'error' : error };
  }
  else
  {
    /**
     * Формирование выходных данных на основании ajax ответа
     */
    for ( var kg in output )
    {
      if (  isJSON( output[kg] ) )
      {
        var direct = await JSON.parse( output[ kg ] );

        if ( direct['error'] != undefined )
        {
          output[kg] = direct;
        }
        else
        {
          var keywords_frequency = {};
          if ( direct['data_by_positions'] != undefined )
          {
            for ( var dbp in direct['data_by_positions'] )
            {
              var keyword = direct['key2phrase'][ direct['data_by_positions'][dbp]['md5'] ];
              if ( keyword != undefined && direct['data_by_positions'][dbp]['shows'] != undefined && direct['data_by_positions'][dbp]['shows'] !== null )
              {
                keywords_frequency[keyword] = direct['data_by_positions'][dbp]['shows'];
              }
            }

            output[kg] = keywords_frequency;
          }
          else
          {
            console.log( '************** ERROR DIRECT RESPONSE **************' );
            console.log( direct );
            console.log( '************** ERROR DIRECT RESPONSE **************' );

            output[kg] = 'data_by_positions';
          }
        }
      }
      else
      {
        output[kg] = 'nojson';
      }
    }
  }

  output[ 'parsing_stats' ] = {
    'duration' : Math.round( ( new Date().getTime() - start_time ) / 1000 ),
    'captchas' : captchaSolver.stats,
    'handler' : 'browser'
  };

  return output;
}

module.exports = keywordsFrequency;
