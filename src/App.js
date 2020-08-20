import React, {Component} from 'react'
import './App.css'
import Particles from 'react-particles-js'
import Navigation  from './components/Navigation/Navigation'
import Logo  from './components/Logo/Logo'
import ImageLinkForm  from './components/ImageLinkForm/ImageLinkForm'
import Rank  from './components/Rank/Rank'
import FaceRecognition  from './components/FaceRecognition/FaceRecognition'
import Signin  from './components/Signin/Signin'
import Register  from './components/Register/Register'


const particlesOptions = {
  particles: {
      number: {
        value:30,
        density: {
          enable: true,
          value_area: 200
        }
      }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: '', 
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',   //Keeps track on where we are on the app
      isSignedIn: false,
      user: {
          id: '',
          name: '',
          email: '',
          entries: 0,
          joined: '', 
      }
    }
  }

  loadUser = (userData) => {
    this.setState({
      user:{
          id: userData.id,
          name: userData.name,
          email: userData.email,
          entries: userData.entries,
          joined: userData.joined
      }
    })
    console.log(userData)
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage')

    const width = Number(image.width)
    const height = Number(image.height)
    
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width ),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (event) => {
    //console.log(event.target.value)
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})

    fetch('https://face-recognition-api-1234.herokuapp.com/imageurl', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
             input: this.state.input
          })
    })
    .then( response => response.json())
    .then( response => {
      this.setState({box: this.calculateFaceLocation(response)})  //Get the face box specs
      if(response){
        fetch('https://face-recognition-api-1234.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              id: this.state.user.id
          })
        })
        .then(  response => response.json())
        .then(  count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log)
      }
    })
    .catch( err => console.log(err) )
    
  }

  onRouteChange = (route) => {
    if(route === 'signin'){
      this.setState(initialState)
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }

    this.setState({route: route})
  }



  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className="App">
        <Particles classsName='particles' params={particlesOptions}/>
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>

        { route === 'home' 
            ?  <div> 
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
                <FaceRecognition imageUrl={imageUrl} box={box}/>
              </div>
            : (
                this.state.route === 'signin' 
                ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/> 
                : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/> 
              )

        }
      </div>
    )
  };
}

export default App;
