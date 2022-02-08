// 'use strict';

class Workout {
   date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration){
       this.coords = coords;
       this.distance = distance;//in km
       this.duration = duration; // in min
    }

    _setDescription(){
        // prettier-ignore
     const months = ['January', 'February', 'March', 'April', 'May', 'June', 
     'July', 'August', 'September', 'October', 'November', 'December'];

     this.description = `${this.type[0].toUpperCase()} 
     ${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`

    }
} 

class Running extends Workout {
   type = 'running';

    constructor(coords, distance, duration, cadence){
          super(coords, distance, duration);
          this.cadence = cadence;
          this.calcPace();
          this._setDescription();
    }

    calcPace(){
        this.pace = this.duration / this.distance;
        return this.pace
    }
}

class Cycling extends Workout {
  type = 'cycling';

    constructor(coords, distance, duration, elevation){
          super(coords, distance, duration);
          this.elevation = elevation;
          this.calcSpeed();
          this._setDescription();
    }

    calcSpeed(){
        this.speed =  (this.distance/ this.duration) /60 ;
        return this.speed;
    }
}


////////////////////////////////////////
// Aplication archeticture


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App{
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElvation.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Someting wrong can't reach your postion");
        }
      );
  }

  _loadMap(postion) {
    const { latitude } = postion.coords;
    const { longitude } = postion.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE){
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm(){
    //clear the inputs
    inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';

      form.style.display = 'none'
      form.classList.add('hidden');
      setTimeout(() => (form.style.display = 'grid'), 1000)
  }

  _toggleElvation(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }


  _newWorkout(e){
      const checkNumberValid = (...inputs) => inputs.every(inp => Number.isFinite(inp));
       

       const checkNumberPositive = (...inputs) =>  inputs.every(inp => inp > 0 );

       e.preventDefault();

      //get the input
      const type = inputType.value;
      const distance = +inputDistance.value;
      const duration = +inputDuration.value;
      const { lat, lng } = this.#mapEvent.latlng;
      let workout;

      //check if the inputs of running postive
       if(type === 'running'){
        const cadence = +inputCadence.value;

        if(!checkNumberValid( distance, duration, cadence) || !checkNumberPositive(distance, duration, cadence) )
                 return alert('the input should be positive number ') ; 

        workout = new Running([lat, lng], distance, duration, cadence);
       }

     //check if the inputs of cycling postive
     if(type === 'cycling'){
        const elevation = +inputElevation.value;

        if(!checkNumberValid ( distance, duration, elevation) || !checkNumberPositive(distance, duration) )
            return alert('the input should be positive number ') ;

        workout = new Cycling([lat, lng], distance, duration, elevation);
       }

     //create new workout
     this.#workouts.push(workout);

     // rendering to the map marker
       this._renderMarkerOnMap(workout)

       //render workout in the list
       this._renderWorkoutList(workout)
 
    //clear the input fields
         this._hideForm();
      }

    _renderMarkerOnMap(workout) {
     L.marker(workout.coords)
       .addTo(this.#map)
       .bindPopup(
         L.popup({
           minwidth: 100,
           maxwidth: 250,
           autoClose: false,
           closeOnClick: false,
           className: `${workout.type}-popup`,
         })
       )
       .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
       .openPopup();
        }

        _renderWorkoutList(workout){
           let html = 
           `<li class="workout workout--${workout.type}" data-id="${workout.id}">
           <h2 class="workout__title">${workout.description}</h2>
           <div class="workout__details">
             <span class="workout__icon"> ${workout.type === 'running' ? '🏃‍♂️':'🦶🏼' } </span>
             <span class="workout__value">${workout.distance}</span>
             <span class="workout__unit">km</span>
           </div>
           <div class="workout__details">
             <span class="workout__icon">⏱</span>
             <span class="workout__value">${workout.duration}</span>
             <span class="workout__unit">min</span>
           </div>`

           if(workout.type === 'running')
             html += 
             `  <div class="workout__details">
             <span class="workout__icon">⚡️</span>
             <span class="workout__value">${workout.pace.toFixed(1)}</span>
             <span class="workout__unit">min/km</span>
           </div>
           <div class="workout__details">
             <span class="workout__icon">🦶🏼</span>
             <span class="workout__value">${workout.cadence}</span>
             <span class="workout__unit">spm</span>
           </div>
           </li>`

           if(workout.type === 'cycling')
            html += 
            `   <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
          </li>`

          form.insertAdjacentHTML('afterend', html);
        } 
  

}


const app = new App();
