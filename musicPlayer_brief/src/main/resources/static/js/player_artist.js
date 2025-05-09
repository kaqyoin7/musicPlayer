
        //选中"从艺术家"出发情况下下一首播放

let rootUrl = 'https://mr1.doubanio.com/'
let player = document.getElementById('musicPlayer')
let isPlaying = true
let songsName = document.getElementById('title')
let cover = document.getElementById('cover')
let artist = document.getElementById('artist')
let songs = ['2a367feb3f3997e010367d330e472ba6/0/fm/song/p50690_128k.mp3',
    '9e2f4466d2645625f4eee03d6e1ae3b8/0/fm/song/p57323_128k.mp4',
    'dc319a33f82d83b13b1a94168dbd42c5/0/fm/song/p133372_128k.mp4',
    '63c4aa1c498592980dc57d9a256f3648/0/fm/song/p383171_128k.mp4',
]
let covers = ['https://img2.doubanio.com/view/subject/m/public/s4507763.jpg',
    'https://img2.doubanio.com/view/subject/m/public/s27241461.jpg',
    'https://img1.doubanio.com/view/subject/m/public/s2765907.jpg',
    'https://img2.doubanio.com/view/subject/m/public/s1638262.jpg']
let songsNames = ['When The Ship Comes In','She\'s Got It', 'Lazy Line Painter Jane', 'Blues Is My Middle Name']
let artists = ['Jessie J','Dido','Jewel','The Weepies']
let i = 0
player.src = rootUrl + songs[i]
player.addEventListener('ended', function () {
    i++
    player.src = rootUrl + songs[i]//换地址
    player.play()
}, false);

function nextMusic(){
    if (++i>songs.length-1) {
        i=0
    }
    let song = songs[i]
    let song_name = songsNames[i]
    let cov = covers[i]
    let artist_name = artists[i]
    songsName.innerText = song_name
    cover.src = cov
    artist.innerText = artist_name
    player.src = rootUrl + song
    player.play()
    console.log('正在播放第'+(i+1)+'首');
}

