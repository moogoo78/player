var g = {};
g.songlist = [];
//g.filelist = [];
g.current_track = 0;
g.history = [];
g.tags = {};

g.getURL = function (file){
  var url;
  if(window.createObjectURL){
    url = window.createObjectURL(file)
  } else if(window.createBlobURL){
    url = window.createBlobURL(file)
  } else if(window.URL && window.URL.createObjectURL){
    url = window.URL.createObjectURL(file)
  } else if(window.webkitURL && window.webkitURL.createObjectURL){
    url = window.webkitURL.createObjectURL(file) 
  }
  //console.log(url);
  return url;
}

g.play = function (track_n) {
  idx = parseInt(track_n)-1
  $('#player').attr('src', g.getURL(g.songlist[idx].file));
  $('#player').attr('type', 'audio/mp3');
  $('#player')[0].play();
  g.current_track = track_n;
  //console.log('playing tr# ' + g.current_track);

//ID3.loadTags(g.songlist[idx].file, function() {
//    var tags = ID3.getAllTags(filename);
 //   console.log(tags.artist + " - " + tags.title + ", " + tags.album);
//});

      function parseFile(file, callback){
        if(g.songlist[idx].file) return callback(g.songlist[idx].file);
        ID3v2.parseFile(file,function(tags){
          //to not overflow localstorage
          localStorage[file.name] = JSON.stringify({
            Title: tags.Title,
            Artist: tags.Artist,
            Album: tags.Album,
            Genre: tags.Genre
          });
          callback(tags);
        })
      }

            parseFile(g.getURL(g.songlist[idx].file),function(tags){
              //console.log(tags);
              });
/*
        ttt = ID3v2.parseFile(g.getURL(g.songlist[idx].file),function(tags){
          console.log(tags);
          //to not overflow localstorage
          localStorage[file.name] = JSON.stringify({
            Title: tags.Title,
            Artist: tags.Artist,
            Album: tags.Album,
            Genre: tags.Genre
          });
          callback(tags);
        });
console.log(ttt);
*/
  
  // display playing
  $('.song').each(function(){
    if ($('.track_n', $(this)).text() == track_n) {
      $(this).addClass('success');
    }
    else {
      $(this).removeClass('success');
    }
  });
  $('#album small').text('');
  $('#album').append('<small> [' + track_n + '/' + g.songlist.length + '] ' + g.songlist[idx].name + '</small>');

  // history
  g.history.push(g.songlist[idx].name);
  localStorage['player_history'] =  g.history;
  $('#player_history ul').append('<li>' + g.songlist[idx].name + '</li>');
/*
  for (var i=0; i<localStorage['player_history'].length; i++) {
  }
*/
}

g.stop = function() {
  $('#player')[0].stop();
}

g.playNext = function () {
  var next_tr = parseInt(g.current_track) + 1;
  if (next_tr <= g.songlist.length) {
    g.play(next_tr) 
  }
  else {
    //g.stop()
  }
}

g.getTrack = function (f) {
  var IGNORE = ['.DS_Store', 'Thumb.db'];
  var FILE_FORMAT = ['.mp3', '.aac', '.m4a', '.mp4', '.ogg'];
  var IMG_FORMAT = ['.jpeg', '.jpg', 'png'];
  /*var size = f.size || f.fileSize || 4096;
  console.log(size);
  if (size < 4095) { 
	  }
  */

  var path = f.webkitRelativePath || f.mozFullPath || f.name;
  var isDirty = false;
  var isTrack = false;

  // read cover
  for (var i=0; i< IMG_FORMAT.length; i++) {
    if (path.search(IMG_FORMAT[i]) >= 0) {
      $('#cover').append('<img src="' + g.getURL(f) + '" width="150" class="img-polaroid">');
    }
  }

  for (i=0; i< IGNORE.length; i++) { 
    if (path.search(IGNORE[i]) >= 0) {
      isDirty = true;
      break;
    }
  }
  if (!isDirty) {
    for (i=0; i< FILE_FORMAT.length; i++) {
      if (path.search(FILE_FORMAT[i]) >= 0) {
        isTrack = true;
      }
    }
  }

  path_dir = path.split('/');
  if (path_dir.length >= 2) {
    path = path_dir[path_dir.length-1];
    $('#album').text(path_dir[0]);
  }

  if (!isDirty && isTrack) {
    return path;
  }
  else {
    return '';
  }
}

$(document).ready(function() {
  $('#input_open').change(function(){
    //console.log($(this).val()); TODO: fakepath

    // init
    $('#songlist tbody tr').remove();
    $('#cover img').remove();
    g.songlist = []
    localStorage['player_history'] = g.history;
    // load songlist
    var filelist = this.files;
    tr_n = 1;
    for (var i=0; i< filelist.length;i++) {
      var file = filelist[i];
      var path = g.getTrack(file);
      if (path !== '') {
        g.songlist.push({'name': path, 'file': file});
        $('#songlist tbody').append('<tr class="song"><td class="track_n">'+tr_n+'</td><td>'+path+'</td></tr>');
        tr_n++;
      }
    }

    // apply song event
    $('.song').click(function() {
      track_n = $('.track_n', this).text();
      g.play(track_n);
    });
  });

});
