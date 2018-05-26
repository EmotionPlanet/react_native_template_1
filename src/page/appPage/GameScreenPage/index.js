import React from "react"
import { Text, View } from "react-native"
import { Actions } from "react-native-router-flux"
import { Page, FlexBox, Heading, Button, Image } from "Neutronium/src/components"

import styles from "./styles"

export default class extends React.Component {

  componentDidMount() {
    console.log(this.props)
  }

  render() {
    return (
      <Page
        style={styles.host}
        {...this.props}
      >
        <View>
          {/* 「ボールを持っているのは」という画像がきます */}
          <Image
            uri="http://placehold.jp/300x300.png?text=xlarge"
          />

          {/* 文字を重ねたい（願望） */}
          <Image
            uri="http://placehold.jp/300x300.png?text=xlarge"
          />
          <Heading size="medium" align="center">北邑メンバー</Heading>

          {/* のちのち消すよ */}
          <Button
            type="dark" 
            onPress={() => Actions.gameSetPage()}
          >
            (仮)GAMESETに遷移
          </Button>
        </View>
      </Page>
    );
  }
}