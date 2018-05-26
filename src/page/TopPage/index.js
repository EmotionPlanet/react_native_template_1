import React from "react"
import { Text, View, AsyncStorage, Dimensions, AppState, ImageBackground } from "react-native"
import { Actions } from "react-native-router-flux"
import { Page, Button, Heading, Avatar, FlexBox, Switch, TextInput, Image } from "Neutronium/src/components"
import { ListGroup, ListGroupItem } from "Neutronium/src/components/listGroup"
import background from "Neutronium/assets/images/background.png"
import avatarImage from "Neutronium/assets/images/avatar.jpg"
import { AccelerometerApiPage } from "Neutronium/src/page/expoApiComponents"

import styles from "./styles"

export default class extends React.Component {
  componentWillMount() {
    this.setState({
      name: "",
      deviceWidth: Dimensions.get('window').width,
      modal1Visible: false,
    })
  }

  componentDidMount() {
    (async () => {
      try {
        const name = await AsyncStorage.getItem("name");
        if (name)
          this.setState({name})
      } catch (e) {

      }
    })()
  }

  render() {
    const { deviceWidth } = this.state;

    return (
      <ImageBackground
        source={background}
        style={{width: "100%", height: "100%"}}
      >
        <FlexBox
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          style={{
            width: deviceWidth,
            ...styles.host
          }}
          {...this.props}
        >
          <View style={styles.view}>
            <Image
              source={avatarImage}
            />
          </View>
        </FlexBox>
        <FlexBox
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          style={styles.box}
        >
          <TextInput
            type="primary"
            defaultValue={this.state.name}
            style={styles.input}
            placeholder="ユーザー名"
            onChangeText={name => this.setState({name})}
          />
          <Button
            type="primary"
            size="large"
            style={styles.submit}
            disabled={!(this.state.name.length > 1)}
            onPress={async () => {
              if (this.state.name.length > 1) {
                await AsyncStorage.setItem("name", this.state.name)
                Actions.makeroomPage()
              }
            }}
          >
            OK
          </Button>
        </FlexBox>
      </ImageBackground>
    );
  }
}
