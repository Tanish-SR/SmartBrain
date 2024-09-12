import React, { Component } from "react";
import Navigation from './components/Navigation/Navigation.jsx';
import Logo from './components/Logo/Logo.jsx';
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.jsx";
import Rank from "./components/Rank/Rank.jsx";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition.jsx";
import Signin from "./components/Signin/Signin.jsx";
import Register from "./components/Register/Register.jsx";
import { loadAll } from "@tsparticles/all";
import Particles, { initParticlesEngine } from "@tsparticles/react";

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      celebrityName: '',
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    };
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  componentDidMount() {
    // Run once when the component mounts
    initParticlesEngine(async (engine) => {
      await loadAll(engine);
    }).then(() => {
      this.setState({ init: true });
    });
  }

  particlesLoaded = (container) => {
    console.log(container);
  };

  options = {
    background: {
      color: {
        value: "transprent",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "attract",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
      },
      modes: {
        attract: {
          distance: 300,
          duration: 0.4, 
        },
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 150,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({ isSignedIn: false });
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    };
  };

  displayFaceBox = (box, name) => {
    this.setState({
      box: box,
      celebrityName: name
    })
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    const PAT = '55a30ed59f7d4a60a71cc2b61a318839';
    const USER_ID = 'invalid2407';
    const APP_ID = 'test';
    const MODEL_ID = 'celebrity-face-detection';
    const MODEL_VERSION_ID = '2ba4d0b0e53043f38dbbed49e03917b6';
    const IMAGE_URL = this.state.input;

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": IMAGE_URL
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
      },
      body: raw
    };

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        if (result.outputs && result.outputs[0].data.regions) {
          const regions = result.outputs[0].data.regions;
          const clarifaiFace = regions[0].region_info.bounding_box;
          const celebrityName = regions[0].data.concepts[0].name; 
          const box = this.calculateFaceLocation(result);
          if (result){
            fetch('http://localhost:3000/image', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
            .then(result => result.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
          }
          this.displayFaceBox(box, celebrityName);
        } else {
          console.log('No regions found in the response.');
        }
      })
      .catch(error => console.log('error', error));
  };

  render() {
    return (
      <div className="App">
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        {this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank 
              name={this.state.user.name} 
              entries={this.state.user.entries} 
              onRouteChange={this.onRouteChange}
              />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} celebrityName={this.state.celebrityName}/>
              <Particles
                id="tsparticles"
                className="particles-background"
                particlesLoaded={this.particlesLoaded}
                options={this.options}
              />
            </div>
          : (
            this.state.route === 'signin'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}

export default App;
