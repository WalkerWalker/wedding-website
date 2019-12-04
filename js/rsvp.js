$(document).ready(function () {

    /********************** RSVP **********************/

    // console.log($('.lang').html());
    $('#rsvp-form').on('submit', function (e) {
        e.preventDefault();
        var data = $(this).serialize();
        var lang = $('.lang').html();
        console.log(data);
        if (lang === 'Let Us Know') {
            $('#alert-wrapper').html(alert_markup('Just a sec! We are saving the information'));
        } else {
            $('#alert-wrapper').html(alert_markup('稍等，我们正在保存您的回复。'));
        }

        $.ajax
            ({
              type: "POST",
              // url: "https://script.google.com/macros/s/AKfycbzAZaJUBMU_5x22JiJdbfSc0SiIRcYQYp1XXn-BOcqAgOCN6n2e/exec",
              url: "https://jinshuju.net/api/v1/forms/zAk2on",
              data: data,
              headers: {
                  "Authorization": "Basic " + btoa("WlRXiRxXBzXHLevPxquBMw" + ":" + "c_d5J569wq7zzc3vQcUDfw")
              },
              // success: function (r_data){
              //   console.log('OK');
              //   console.log(r_data);
              // }
          }).done(function (resp) {
              console.log('OK');
              console.log(resp);
              // if (navigator.language.substring(0, 2) == "cn") {
              //     console.log('this is cn');
              // } else {
              //     console.log('this is en');
              // }
              if (lang === 'Let Us Know') {
                  $('#alert-wrapper').html(alert_markup('Thank you. We have received your reply. If you have any questions, drop us an email at hello@yiyunjiamin.com or I am sure you know how to reach us. ^_^'));
              } else {                  
      $('#alert-wrapper').html(alert_markup('谢谢。我们已经收到了您的回复。如果有任何问题，可以发邮件至 hello@yiyunjiamin.com 或者您肯定知道如何联系到我们 ^_^'));
              }

              // sleep(2000);
              // $('#alert-wrapper').html('');
          }).fail(function (e_resp) {
              console.log('failed');
              console.log('e_resp');
              if (lang === 'RSVP') {
                  $('#alert-wrapper').html(alert_markup('Sorry! Something went wrong.'));
              } else {
                  $('#alert-wrapper').html(alert_markup('抱歉！出了点状况。'));
              }
          });
    });


});

/********************** Extras **********************/

// alert_markup
function alert_markup(msg) {
    return '<div class="message-body">' + msg + '</div>';
}




/********************** Logic form **********************/
function hideExtraNames() {
    for (i = 1; i <= 4; i++) {
        document.getElementById('name' + i).style.display = "none";
    }
}

function displayNameAndMore(n) {
  console.log(n);

  hideExtraNames();

  for (i = 1; i <= parseInt(n); i++) {
      document.getElementById('name' + i).style.display = "block";
  }

}



function displayQuestion(answer) {
  console.log(answer);

  if (answer == "go") { // hide the div that is not selected

    document.getElementById('ifgo').style.display = "block";
    // hideExtraNames();
    // console.log(document.getElementById('plusones').value);
    displayNameAndMore(document.getElementById('plusones').value);
  } else if (answer == "nogo") {

    document.getElementById('ifgo').style.display = "none";
    hideExtraNames();
  }
}
