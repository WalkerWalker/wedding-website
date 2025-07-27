// EmailJS Configuration
const EMAIL_SERVICE_ID = 'service_oc31h7d';
const EMAIL_TEMPLATE_ID = 'template_z5r160r';
const EMAIL_PUBLIC_KEY = '25qYR-Ao_PUHNELuD';

$(document).ready(function () {
    // Initialize EmailJS
    emailjs.init(EMAIL_PUBLIC_KEY);

    // RSVP Form Handler
    $('#rsvp-form').on('submit', function (e) {
        e.preventDefault();
        
        var lang = $('.lang').html();
        var isEnglish = (lang === 'Let Us Know');
        
        // Show loading message
        if (isEnglish) {
            $('#alert-wrapper').html(alert_markup('Just a sec! We are saving the information...'));
        } else {
            $('#alert-wrapper').html(alert_markup('稍等，我们正在保存您的回复...'));
        }

        // Disable submit button
        var submitButton = $('.button');
        submitButton.prop('disabled', true);
        if (isEnglish) {
            submitButton.find('.lang').html('Sending...');
        } else {
            submitButton.find('.lang').html('发送中...');
        }

        // Collect form data
        var formData = collectFormData();
        
        // Send email via EmailJS
        emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, formData)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                
                if (isEnglish) {
                    $('#alert-wrapper').html(alert_markup('Thank you! We have received your RSVP. If you have any questions, drop us an email at <a href="mailto:hello@yiyunjiamin.com">hello@yiyunjiamin.com</a> or I am sure you know how to reach us. ^_^'));
                } else {
                    $('#alert-wrapper').html(alert_markup('谢谢！我们已经收到了您的回复。如果有任何问题，可以发邮件至 <a href="mailto:hello@yiyunjiamin.com">hello@yiyunjiamin.com</a> 或者您肯定知道如何联系到我们 ^_^'));
                }
            })
            .catch(function(error) {
                console.log('FAILED...', error);
                
                if (isEnglish) {
                    $('#alert-wrapper').html(alert_markup('Sorry! Something went wrong. Please try again or email us directly.'));
                } else {
                    $('#alert-wrapper').html(alert_markup('抱歉！出了点状况。请重试或直接发邮件给我们。'));
                }
            })
            .finally(function() {
                // Re-enable submit button
                submitButton.prop('disabled', false);
                if (isEnglish) {
                    submitButton.find('.lang').html('Let Us Know // 回复');
                } else {
                    submitButton.find('.lang').html('回复 // Let Us Know');
                }
            });
    });
});

// Collect all form data for EmailJS
function collectFormData() {
    var data = {
        name: $('input[name="field_2"]').val() || '',
        email: $('input[name="field_1"]').val() || '',
        attendance: $('input[name="field_3"]:checked').val() || '',
        plus_ones: $('input[name="field_15"]').val() || '0',
        dietary_restrictions: $('input[name="field_5"]').val() || '',
        notes: $('textarea[name="field_14"]').val() || '',
        timestamp: new Date().toISOString(),
        
        // Plus one details
        plus_one_1_name: $('input[name="field_6"]').val() || '',
        plus_one_1_dietary: $('input[name="field_7"]').val() || '',
        plus_one_2_name: $('input[name="field_8"]').val() || '',
        plus_one_2_dietary: $('input[name="field_9"]').val() || '',
        plus_one_3_name: $('input[name="field_10"]').val() || '',
        plus_one_3_dietary: $('input[name="field_11"]').val() || '',
        plus_one_4_name: $('input[name="field_12"]').val() || '',
        plus_one_4_dietary: $('input[name="field_13"]').val() || ''
    };
    
    console.log('Form data collected:', data);
    return data;
}

// Alert markup function
function alert_markup(msg) {
    return '<div class="message-body">' + msg + '</div>';
}

// Form logic functions (unchanged)
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
    if (answer == "go") {
        document.getElementById('ifgo').style.display = "block";
        displayNameAndMore(document.getElementById('plusones').value);
    } else if (answer == "nogo") {
        document.getElementById('ifgo').style.display = "none";
        hideExtraNames();
    }
}
