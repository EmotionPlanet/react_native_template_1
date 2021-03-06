import React from "react"
import { Text, View, ImageBackground, Vibration } from "react-native"
import { Actions } from "react-native-router-flux"
import { Page, FlexBox, Heading, Button, Image } from "Neutronium/src/components"
import background from "Neutronium/assets/images/game_screen.png"
import * as firebase from 'firebase';
import { Accelerometer } from 'expo'

import styles from "./styles"


const round = (n) => {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}

const calculationDistance = (prevData, nowData) => {
  const x = Math.pow(prevData.x - nowData.x, 2);
  const y = Math.pow(prevData.y - nowData.y, 2);
  const z = Math.pow(prevData.z - nowData.z, 2);
  return Math.sqrt(x+y+z);
}

export default class extends React.Component {

  componentWillMount() {
    this.setState({
      subscriber: undefined,
      ref: undefined,
      room: undefined,
      vibPattern1 : [10, 10, 10],
      vibPattern2 : [100, 100, 100],
      vibPattern3 : [500, 500, 500],
      vibPattern4 : [1000, 1000, 1000],
      distance: undefined,
      prevAccelerometerData: {},
      accelerometerData: {},
      hasFinishFunc: false
    })
  }

  componentDidMount() {
    (async() => {
      const {
        roomName,
        myId,
        ...props
      } = this.props

      if (this._subscription) {
        this._unsubscribe();
      } else {
        this._subscribe();
      }
      this.setState({
        distance: this.props.accelerometerData
      })

      await firebase.database().ref('rooms/' + roomName + "/users/" + myId ).update({
        is_ready: false
      })

      Accelerometer.setUpdateInterval(300);

      this.setState(
        {
          subscriber: async snapshot => {
            const val = snapshot.val()

            const room = {
              ...val,
              users: Object.entries(val.users || {}).map(([i, v]) => ({
                id: i,
                ...v,
              }))
            }

            {/* ゲームゾーン */}
            if (room.ball_holding_user == myId) {
              this._vibration();
            } else {
              Vibration.cancel()
            }

            if (room.finish_time && !this.state.hasFinishFunc) {
              
              setTimeout(
                async () => {
                  Vibration.cancel()
                  if (this.state.room.ball_holding_user == myId) {
                    await firebase.database().ref('rooms/' + roomName  ).update({
                      loser: myId,
                      finish_time: null,
                      ball_holding_user: null,
                      is_start: false
                    })
                  }
 
                  const f = () => {
                    console.log('debug')
                    if (this.state.room.loser) 
                      Actions.resultPage({
                        room: this.state.room, 
                        roomName,
                        myId
                      })
                    else 
                      setTimeout( f, 500 )
                  }
                  f()
                },
                console.log(+new Date() - +new Date(room.finish_time)) ||  Math.abs(+new Date() - +new Date(room.finish_time))
              )
              this.setState({
                hasFinishFunc: true
              })
            }

            {/* ゲームゾーン */}

            this.setState({
              room
            })
          },
          ref: firebase.database().ref('rooms/' + roomName )

        },
        async () => {
          await this.state.ref.on('value', this.state.subscriber);
        }
      )

    })()
  }

  componentWillUnmount() {
    (async() => {
      const {
        roomName,
        myId,
      } = this.props
      Vibration.cancel()

      this._unsubscribe();

      this.state.ref.off('value', this.state.subscriber)

      await firebase
        .database()
        .ref('rooms/' + roomName + '/users/' + myId)
        .remove()
    })()
  }

  _vibration(){
    Vibration.vibrate(this.state.vibPattern4, true);
  }

  _subscribe = () => {
    const {
      roomName,
      myId,
    } = this.props

    this._subscription = Accelerometer.addListener(async accelerometerData => {
      const {x:prevX, y:prevY, z:prevZ} = this.state.accelerometerData;
      const {x, y, z} = accelerometerData;
      
      let count = this.state.count + 1;

      const distanse = calculationDistance(this.state.prevAccelerometerData, this.state.accelerometerData);
      const isDistanse = distanse > 1.5 ? true : false;

      if (this.state.room) {


        const room = {
          ...this.state.room,
          users: Object.entries(this.state.room.users || {}).map(([i, v]) => ({
            id: i,
            ...v,
          }))
        }

        if (isDistanse) console.log("catch motion!!")
        if (room.ball_holding_user == myId && isDistanse) {

          const userIdList = room.users.map(x => x.id)
            .filter(x => x != myId)

          await firebase.database().ref('rooms/' + roomName  ).update({
            ball_holding_user: userIdList[Math.floor(Math.random() * userIdList.length)]
          })
        }

      }

      this.setState({
        prevAccelerometerData: this.state.accelerometerData,
        accelerometerData,
        count,
      });

    });
  }

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  }


  render() {
    return (
      <ImageBackground
        source={background}
        style={[
          styles.host,
          {width: "100%", height: "100%", backgroundColor: "#fff500", position: "relative"}
        ]}
        {...this.props}
      >
        <View
          style={{
            position: 'absolute',
            bottom: "15%",
            width: "100%"
          }}
        >
          
          <Heading 
            size="medium" 
            align="center"
          >          
            {this.state.room ? (this.state.room.ball_holding_user && (this.state.room.users.find(x => x.id == this.state.room.ball_holding_user) || {} ).name) : ""}
          </Heading>
        </View>
      </ImageBackground>
    );
  }
}
