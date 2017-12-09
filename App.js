
// The imported items are straightforward. I'm using React Navigation for my navigation needs.
import React, { Component } from 'react';
import {
  Text,
  View,
  Alert,
  Image,
  Button,
  FlatList,
  TextInput,
  Dimensions,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import unavailable from './Images/unavailable.jpg';

// MovieSearch is the first screen the user sees, and it holds most of the logic.
class MovieSearch extends Component {

  // I need to initialize some elements in the state.
  constructor(props) {
    super(props);
    this.state = { text: '', data: [], loading: false, };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // This method is called when the user clicks on a movie from the list.
  // It receives a movie object which holds all of the movie's information.
  // It calls the navigate method to navigate to the second screen ('MovieInfo').
  // The navigate method also passes the movie object to the second screen.
  handlePress(movie) {
    this.props.navigation.navigate('MovieInfo', movie)
  }

  // This method is called when the user clicks the search button.
  // First it makes sure a previous fetch() request is not in progress, and that the query is valid.
  // Next it will make a new fetch() request, and update the data in the state if successful.
  handleSubmit() {
    if (this.state.loading) {
      alert('Please wait...');
    }
    else if (this.state.text.length < 1) {
      alert('Search cannot be empty!');
    } else {
      this.setState({ data: [], loading: true });
      const url = 'https://theimdbapi.org/api/find/movie?title=' + encodeURI(this.state.text);
      fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson === null || responseJson[0] === null) {
            alert('No results found!');
            this.setState({ loading: false });
          } else {
            this.setState({ data: responseJson, loading: false });
          }
        })
        .catch((error) => {
          this.setState({ loading: false });
        });
    }
  }

  // This is what the user sees in the first screen.
  // ActivityIndicator is only visible when the state is loading (that is, when a fetch() request is active).
  // I'm using a FlatList to hold my data (ListView is now deprecated).
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.containerOne}>
          <TextInput style={styles.textInput} placeholder='Type movie name here' maxLength={40} onChangeText={(text) => this.setState({ text })} />
        </View>
        <View style={styles.containerOne}>
          <Button onPress={this.handleSubmit} title='Search' />
        </View>
        <View style={styles.containerTwo}>
          {this.state.loading && <ActivityIndicator size='large' animating={true} color='black' style={styles.loader} />}
          <FlatList
            data={this.state.data}
            extraData={this.props.data}
            renderItem={({ item }) => <Text style={styles.textListItems}
              onPress={this.handlePress.bind(this, item)}>{item.title + ' (' + item.year + ')'}</Text>}
            keyExtractor={item => item.imdb_id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    );
  }
}

// MovieInfo is the second screen. It shows the selected movie's information.
class MovieInfo extends React.Component {

  // Notice that the cases where the movie's Poster or Storyline are missing are handled.
  render() {
    const { state } = this.props.navigation;
    return (
      <View style={styles.mainContainer}>
        <View style={styles.containerOne}>
          <Text style={styles.textMovie} numberOfLines={1}>{state.params.title + ' (' + state.params.year + ')'}</Text>
        </View>
        <View style={styles.containerThree}>
          {state.params.poster.thumb == '' && <Image style={styles.imageMovie} source={unavailable} />}
          {state.params.poster.thumb !== '' && <Image style={styles.imageMovie} source={{ uri: state.params.poster.thumb }} />}
        </View>
        <View style={styles.containerFour}>
          <ScrollView style={styles.inputText}>
            {state.params.storyline == '' && <Text style={styles.textPlot}>(Plot is Missing)</Text>}
            {state.params.storyline !== '' && <Text style={styles.textPlot}>{state.params.storyline}</Text>}
          </ScrollView>
        </View>
      </View>
    )
  }
}

// I'm using a StackNavigator from React Navigation for my navigation needs.
// This is where I announce the different screens and their headers.
const RootNavigator = StackNavigator({
  MovieSearch: {
    screen: MovieSearch,
    navigationOptions: {
      headerTitle: 'Movie Search',
      headerTitleStyle: { alignSelf: 'center' }
    },
  },
  MovieInfo: {
    screen: MovieInfo,
    navigationOptions: {
      headerTitle: 'Movie Info',
      headerTitleStyle: { alignSelf: 'center' },
      headerRight: (<View></View>)
    },
  },
});

// The navigator must be exported.
export default RootNavigator;

// And this is the StyleSheet where I store all of my different styles.
const styles = StyleSheet.create({
  mainContainer: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    backgroundColor: '#C0C0C0',
  },
  containerOne: {
    flex: 1,
    justifyContent: 'center',
  },
  containerTwo: {
    flex: 8,
  },
  containerThree: {
    flex: 6,
    alignItems: 'center',
  },
  containerFour: {
    flex: 4.5,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textListItems: {
    fontSize: 30,
    marginVertical: 15,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textMovie: {
    flex: 1,
    fontSize: 30,
    marginTop: 10,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textPlot: {
    flex: 1,
    fontSize: 20,
    color: '#202020',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputText: {
    marginBottom: 100,
    marginHorizontal: 5,
  },
  imageMovie: {
    width: 240,
    height: 305,
  },
  separator: {
    height: 3,
    marginHorizontal: 10,
    backgroundColor: 'black',
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    marginTop: 70,
  },
});
