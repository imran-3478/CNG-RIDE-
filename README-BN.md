# CNG RIDE Android App

এই Android project আপনার বর্তমান CNG RIDE website-কে app হিসেবে চালায়:

https://imran-3478.github.io/CNG-RIDE-/

## যা আছে

- Passenger / Driver login ও registration
- Live GPS location
- Nearby CNG map
- Ride request
- Driver accept / reject
- Call / SMS / external actions
- Supabase backend (website-এর ভেতর থেকেই)
- ৳20/km default fare
- Driver final fare confirmation
- Passenger ride history
- Android back button
- Location permission handling
- File upload support
- Professional splash screen
- GitHub Actions দিয়ে APK build

## Android Studio দিয়ে APK বানানো

1. Android Studio খুলুন।
2. এই project folder Open করুন।
3. Gradle sync শেষ হতে দিন।
4. `Build > Build APK(s)` নির্বাচন করুন।
5. Debug APK পাবেন:
   `app/build/outputs/apk/debug/app-debug.apk`

## শুধু GitHub ব্যবহার করে APK বানানো

Project GitHub-এ push করার পর:

1. GitHub repo খুলুন।
2. `Actions` এ যান।
3. `Build CNG RIDE APK` workflow নির্বাচন করুন।
4. `Run workflow` চাপুন।
5. Build শেষ হলে `CNG-RIDE-debug-apk` artifact download করুন।

## গুরুত্বপূর্ণ

এই version আপনার live website-কে WebView-এর মাধ্যমে Android app-এ দেখায়। তাই website-এর নতুন update app-এও স্বয়ংক্রিয়ভাবে দেখা যাবে।

পরে চাইলে এটিকে সম্পূর্ণ native Android app-এ রূপান্তর করা যাবে।
