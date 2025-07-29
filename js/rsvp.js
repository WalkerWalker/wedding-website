// EmailJS Configuration
const EMAIL_SERVICE_ID = 'service_rtnngv5';
const EMAIL_TEMPLATE_ID = 'template_jdgj3xo'; // Organizer notification template
const CONFIRMATION_TEMPLATE_ID = 'template_s66veh1'; // Guest confirmation template (you'll need to create this)
const EMAIL_PUBLIC_KEY = 'P5J4xu_1sV2U8ojt5';

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
        var confirmationData = prepareConfirmationData(formData, isEnglish);
        
        // Send organizer notification email first
        emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, formData)
            .then(function(response) {
                console.log('Organizer email SUCCESS!', response.status, response.text);
                
                // Now send confirmation email to guest
                return emailjs.send(EMAIL_SERVICE_ID, CONFIRMATION_TEMPLATE_ID, confirmationData);
            })
            .then(function(response) {
                console.log('Guest confirmation email SUCCESS!', response.status, response.text);
                
                if (isEnglish) {
                    $('#alert-wrapper').html(alert_markup('Thank you! We have received your RSVP and sent you a confirmation email. If you have any questions, drop us an email at <a href="mailto:hello@yiyunjiamin.com">hello@yiyunjiamin.com</a> or I am sure you know how to reach us. ^_^'));
                } else {
                    $('#alert-wrapper').html(alert_markup('谢谢！我们已经收到了您的回复并发送了确认邮件给您。如果有任何问题，可以发邮件至 <a href="mailto:hello@yiyunjiamin.com">hello@yiyunjiamin.com</a> 或者您肯定知道如何联系到我们 ^_^'));
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

// Prepare confirmation email data for guests
function prepareConfirmationData(formData, isEnglish) {
    // Use current website language instead of browser language
    const isChinese = !isEnglish; // If not English, then Chinese
    
    // Determine RSVP status text
    const isAttending = formData.attendance === 'go';
    const rsvpStatusEn = isAttending ? 'Attending ✅' : 'Not Attending ❌';
    const rsvpStatusCn = isAttending ? '参加 ✅' : '不参加 ❌';
    
    // Prepare plus-ones list (text-only for email)
    let plusOnesList = '';
    let plusOnesHtml = '';
    let hasPlusOnes = false;
    
    for (let i = 1; i <= 3; i++) {
        const name = formData[`plus_one_${i}_name`];
        const notes = formData[`plus_one_${i}_notes`];
        
        if (name && name.trim() !== '') {
            hasPlusOnes = true;
            // Text version for plain display
            plusOnesList += `• ${name}${notes ? ` (${notes})` : ''}\n`;
            // HTML version for email template
            plusOnesHtml += `<div class="plus-one-item"><strong>${name}</strong>${notes ? `<br><small>${notes}</small>` : ''}</div>`;
        }
    }
    
    // Prepare confirmation email data
    const confirmationData = {
        // Send to guest's email
        to_email: formData.main_contact_email,
        to_name: formData.main_contact_name,
        
        // Guest information
        guest_name: formData.main_contact_name,
        
        // RSVP status
        rsvp_status_en: rsvpStatusEn,
        rsvp_status_cn: rsvpStatusCn,
        
        // Conditional content based on attendance
        status_class: isAttending ? 'status-attending' : 'status-not-attending',
        event_details_display: isAttending ? 'display: block;' : 'display: none;',
        
        // Plus-ones
        plus_ones_display: hasPlusOnes ? 'display: block;' : 'display: none;',
        plus_ones_list: plusOnesList,
        
        // Special notes
        special_notes: formData.general_notes || '',
        notes_display: formData.general_notes ? 'display: block;' : 'display: none;',
        
        // Language class for conditional display
        language_class: isChinese ? 'chinese-content' : '',
        
        // Email subject (EmailJS will use this if configured)
        subject: isChinese ? '婚礼回复确认 - 林依韵 & 朱嘉珉' : 'Wedding RSVP Confirmation - Yiyun & Jiamin',
        
        // Timestamp
        submission_date: new Date().toLocaleDateString(),
        
        // Current website language for debugging
        website_language: isEnglish ? 'en' : 'cn'
    };
    
    console.log('Confirmation email data prepared:', confirmationData);
    return confirmationData;
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
