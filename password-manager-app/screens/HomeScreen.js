import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
} from 'react-native';
import { ListItem , Button, Icon, Input } from 'react-native-elements';
import AuthHelper from '../services/AuthHelper';
import HttpHelper from '../services/HttpHelper';
import BottomSheet from "react-native-raw-bottom-sheet";
import { FloatingAction } from 'react-native-floating-action';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props){
    super(props)
    this.http = new HttpHelper()
    this.auth = new AuthHelper()

    this.state = {
      accounts: [],
      addAccountString: '',
      addPasswordString: ''
    }
  }

  componentDidMount(){
    this.getAccounts()
  }

  async getAccounts(){
    
    const url = '/accounts'
    const token = await this.auth.getToken()
  
    this.http.get({url, headers: {'x-access-token': token}})
      .then(response => this.setState({accounts: response.accounts}))
  }

  async getPasswordForAccount(account){
        
    const url = '/account/' + account
    const token = await this.auth.getToken()
  
    this.http.get({url, headers: {'x-access-token': token}})
      .then(response => {
        this.accountInfo = response
        this.sheet.open()
      })
  }

  showPassword(){
    Alert.alert(
      'Password for ' + this.accountInfo.account,
      this.accountInfo.password,
      [
        {text: 'Copy', onPress: () => {Clipboard.setString(this.accountInfo.password)}},
      ],
      {cancelable: true},
    )
  }

  deleteAccount(){
    Alert.alert(
      'Delete',
      'Are you sure that you want to delete ' + this.accountInfo.account + '?',
      [
        {text: 'Yes', onPress: async () => {
          const url = '/account/' + this.accountInfo.account + '/delete'
          const token = await this.auth.getToken()
        
          this.http.delete({url, headers: {'x-access-token': token}})
            .then(response => {
              this.sheet.close()
              this.getAccounts()
            })
        }},
        {text: 'Cancel', onPress: () => null},
      ],
      {cancelable: true},
    )
  }

  async addAccount(account, password){
    if(account == '' || password == ''){
      alert('Missing fields')
      return
    }

    const url = '/account'
    const token = await this.auth.getToken()
  
    this.http.post({url, headers: {'x-access-token': token, account, password}})
      .then(response => {
        this.addSheet.close()
        this.getAccounts()
      })
  }

  render() {
    
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={{fontSize: 32, fontWeight: 'bold', color: 'white'}}>Password Manager</Text>
          <Text style={{fontSize: 12, fontStyle: 'italic', color: 'white'}}>Made with Express.js, MongoDB and React Native</Text>
        </View>
        <View style={{flex: 3}}>
          {
            this.state.accounts.map((l, i) => (
              <ListItem
                key={i}
                title={l}
                rightIcon={{name: 'chevron-right'}}
                bottomDivider
                onPress={() => this.getPasswordForAccount(l)}
              />
            ))
          }
        </View>
        <BottomSheet
          ref={ref => {
            this.sheet = ref;
          }}
          height={200}
          duration={250}
          customStyles={{
            container: {
              justifyContent: "center",
              alignItems: "center"
            }
          }}
        >
        <View style={{flex: 1, justifyContent: 'space-evenly'}}>
          <Button 
            title="Show Password"
            type="outline"
            buttonStyle={{width: 250}}
            onPress={() => this.showPassword()}
          />
          <Button 
            title="Delete"
            type="outline"
            buttonStyle={{width: 250}}
            onPress={() => this.deleteAccount()}
          />
        </View>
        </BottomSheet>
        <BottomSheet
          ref={ref => {
            this.addSheet = ref;
          }}
          onClose={() => this.setState({addAccountString: '', addPasswordString: ''})}
          height={300}
          duration={250}
          customStyles={{
            container: {
              justifyContent: "center",
              alignItems: "center"
            }
          }}
        >
        <View style={{flex: 1, justifyContent: 'space-evenly'}}>
          <Input
            inputContainerStyle={{width: 250, height: 50}}
            placeholder='www.website.com'
            onChangeText={(addAccountString) => this.setState({addAccountString})}
          />
          <Input
            inputContainerStyle={{width: 250, height: 50}}
            placeholder='password'
            secureTextEntry
            onChangeText={(addPasswordString) => this.setState({addPasswordString})}
          />
          <Button 
            title="Add Account"
            type="outline"
            buttonStyle={{width: 250}}
            onPress={() => this.addAccount(this.state.addAccountString, this.state.addPasswordString)}
          />
        </View>
        </BottomSheet>
        <FloatingAction 
          ref={(ref) => { this.floatingAction = ref; }}
          overlayColor={'rgba(0, 0, 0, 0.0)'}
          onPressMain={() => this.addSheet.open()}
          floatingIcon={
            <Icon name='add' color='white'/>
          }
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4286f4',
  }
});
