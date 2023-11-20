export const errorMessage = {
    auth: {
        invalidOtp: 'کد اشتباه است',
        otpAlreadySend:
            'کد تایید ارسال شده است، پس دو دقیقه دوباره امتحان کنید',
        passwordMissed: 'رمزعبور وجود ندارد',
        alreadyHaveAccount: 'شما قبلا ثبت نام کرده اید',
        validation: {
            password: {
                required: 'رمز عبور اجباری است',
                validate:
                    'رمزعبور باید حداقل ۸ کاراکتر شامل یک حرف کوچک، یک حرف بزرگ، یک عدد و یک سمبل باشد',
            },
            phone: {
                required: 'شماره تلفن اجباری است',
                validate: 'شماره تلفن باید به فرمت 09123456789 باشد',
            },
            otp: {
                required: 'کد اجباری است',
            },
        },
    },
    document: {
        unsupportedFileType: 'فرمت فایل نامعتبر است',
        wrongPdf: 'فایل pdf دارای مشکل است',
        documentNotFound: 'سند یافت نشد',
        documentNotReady: 'سند در حال بررسی است',
        textNotFound: 'متنی برای این سند یافت نشد',
        wait: 'لطفا صبر کنید',
        ocrDone: 'نویسه نگاری قبلا انجام شده است',
        validation: {
            format: 'فایل معتبر نمیباشد',
            size: 'حجم فایل بیش از حد مجاز است',
        },
    },
    wallet: {
        noPackage: 'پیکیج فعالی ندارید',
        insufficientBalance: 'اعتبار کافی نیست',
    },
    user: {
        wrongPassword: 'رمز عبور اشتباه است',
    },
    order: {
        gatewayError: 'خطای درگاه بانکی',
        orderNotFound: 'سفارش یافت نشد',
    },
    package: {
        packageNotFound: 'پیکیج یافت نشد',
    },
};
