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
                    submitButton.find('.lang').html('Let Us Know');
                } else {
                    submitButton.find('.lang').html('回复');
                }
            });
    });
});

// Collect all form data for EmailJS
function collectFormData() {
    var data = {
        // Main contact information
        main_contact_name: $('input[name="field_2"]').val() || '',
        main_contact_email: $('input[name="field_1"]').val() || '',
        attendance: $('input[name="field_3"]:checked').val() || '',
        
        // Plus-one information
        plus_one_1_name: $('input[name="plus_one_1_name"]').val() || '',
        plus_one_1_notes: $('input[name="plus_one_1_notes"]').val() || '',
        
        plus_one_2_name: $('input[name="plus_one_2_name"]').val() || '',
        plus_one_2_notes: $('input[name="plus_one_2_notes"]').val() || '',
        
        plus_one_3_name: $('input[name="plus_one_3_name"]').val() || '',
        plus_one_3_notes: $('input[name="plus_one_3_notes"]').val() || '',
        
        // General information
        general_notes: $('textarea[name="general_notes"]').val() || '',
        timestamp: new Date().toISOString()
    };
    
    console.log('Form data collected:', data);
    return data;
}

// Alert markup function
function alert_markup(msg) {
    return '<div class="message-body">' + msg + '</div>';
}

// Simplified form logic for static plus-one sections

function displayQuestion(answer) {
    console.log(answer);
    if (answer == "go") {
        document.getElementById('plus-ones-section').style.display = "block";
    } else if (answer == "nogo") {
        document.getElementById('plus-ones-section').style.display = "none";
        // Clear all plus-one fields when switching to "no go"
        clearPlusOneFields();
    }
}

// Clear all plus-one input fields
function clearPlusOneFields() {
    const plusOneFields = [
        'plus_one_1_name', 'plus_one_1_notes',
        'plus_one_2_name', 'plus_one_2_notes', 
        'plus_one_3_name', 'plus_one_3_notes'
    ];
    
    plusOneFields.forEach(fieldName => {
        $(`input[name="${fieldName}"]`).val('');
    });
    
    console.log('Cleared all plus-one fields');
}
