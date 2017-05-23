/**
 * Keep a list of all available lyrics providers and the index of the currently being used
 */
var lyricsProviders;
var currentLyricsProviderIndex;
setTimeout(function() {
  window.lyricsProviders = [
    "vagalume.js",
    //"dark_lyrics.js",
    //"metrolyrics.js"
  ];

  window.fetchFromFirstLyricsProvider = function(DOMArtist, DOMTrack){
      currentLyricsProviderIndex = -1;
      onLyricsLoadStart();
      fetchFromNextLyricsProvider(DOMArtist, DOMTrack);
  }

  window.fetchFromNextLyricsProvider = function (DOMArtist, DOMTrack){
      currentLyricsProviderIndex ++;
      //ignore current index, just fetch from vagalume for now
      fetchLyrics(DOMArtist, DOMTrack);
  }

  window.nextLyricsProviderExists = function (){
      return currentLyricsProviderIndex + 1 < lyricsProviders.length;
  }
}, 500);
