# VueCalendarApplication
A Calendar app built with Vuejs, VueEx, Vuetify, Vuelidate and Firebase Firestore and Authentication
This was made for a lodge( a kind of private hotel for poor people)  as a room booking system which has 2 types of users of the calendar:
 - "filieres" : they make "room booking" requests on behalf of their constituants( arrival & departure times, type of room, guest name and details)
 - lodge admin staff: they confirm the requests;
 the "filiere users see only the calendar entries regarding their "filiere"
 Lodge admin staff see the consolidated calendar entries. Each 'Filiere" has a distinct "color" for its booking on the Calendar.
 Room requests have 2 statuses: 
   - to be validated( when the request is created or modified by a "filiere"
   - validated : status that can only be set by the lodge admin staff
 There is a notification system in place where notifications between the affected filiere and the lodge admin staff when bookings are created or modified.
You need to authenticate via userid and password; if not you are reoriented to the Signin page.
"Filiere users" see in their menu after signing in 2 options. The Calendar page and the Notifications Page.On the calendar page they can create inline new booking requests and update their existing bookings.
Lodge admin staff have 2 additional menu items: "Filieres" And "Users". They can create/update/delete "Filieres" and "Users" for the "Filieres" . They cannot create Lodge admin staff users - those have to be created by hand in the firestore console.
Additional info: alain.vandermeersch@gmail.com
