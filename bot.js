const Discord = require('discord.js');
const conv = require('number-to-words');
const moment = require('moment');
const dateformat = require('dateformat');
const ms = require('parse-ms')
const config = process.env.CONFIG;

const prefix = process.env.PREFIX;
const token = process.env.TOKEN;
const private = process.env.PRIVATE;
const lang = process.env.LANG;
const regDate = process.env.REGDATE;
const sub = process.env.SUB;

const client = new Discord.Client({ disableEveryone: true});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

if(lang == 'en') {

let cmds = {
  play: { cmd: 'play', a: ['p'] },
  skip: { cmd: 'skip', a: ['s'] },
  stop: { cmd: 'stop' },
  pause: { cmd: 'pause' },
  resume: { cmd: 'resume', a: ['r'] },
  volume: { cmd: 'volume', a: ['vol'] },
  queue: { cmd: 'queue', a: ['q'] },
  repeat: { cmd: 'repeat', a: ['re'] },
  forceskip: { cmd: 'forceskip', a: ['fs', 'fskip'] },
  skipto: { cmd: 'skipto', a: ['st'] },
  nowplaying: { cmd: 'nowplaying', a: ['np'] },
  mysub: { cmd: 'mysub', a: ['subscription', 'sub'] }
};

Object.keys(cmds).forEach(key => {
var value = cmds[key];
  var command = value.cmd;
  client.commands.set(command, command);

  if(value.a) {
    value.a.forEach(alias => {
    client.aliases.set(alias, command)
  })
  }
})
} else if(lang == 'ar') {
  let cmds = {
    play: { cmd: 'شغل', a: ['ش'] },
    skip: { cmd: 'تخطي', a: ['ت'] },
    stop: { cmd: 'طفي', a: ['ط'] },
    pause: { cmd: 'وقف', a: ['و'] },
    resume: { cmd: 'كمل', a: ['ك'] },
    volume: { cmd: 'صوت', a: ['ص'] },
    queue: { cmd: 'قائمه', a: ['ق', 'قائمة'] },
    repeat: { cmd: 'كرر', a: ['اعادة', 'اعاده'] },
    forceskip: { cmd: 'تخطي-اجباري', a: ['fs', 'fskip'] },
    skipto: { cmd: 'تخطي-الى', a: ['ت-ا'] },
    nowplaying: { cmd: 'الان', a: ['الأن'] },
    mysub: { cmd: 'اشتراكي' }
  };

Object.keys(cmds).forEach(key => {
  var value = cmds[key];
    var command = value.cmd;
    client.commands.set(command, command);

    if(value.a) {
      value.a.forEach(alias => {
      client.aliases.set(alias, command)
    })
    }
})
}


const ytdl = require('ytdl-core');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");

let active = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => {
    console.log(`Created By: MohmaedAlhassny`);
    console.log(`Developed By: ! Abdulrhman with ♥`);
    console.log(`Guilds: ${client.guilds.size}`);
    console.log(`Users: ${client.users.size}`);
    client.user.setActivity(`Type ${prefix}help`,{type: 'Playing'});
});

client.on('message', async msg => {
    if(msg.author.bot) return undefined;


    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (msg.content.match(prefixMention)) {
    return msg.reply(`My prefix is \`${prefix}\``);
  }

  if(!msg.content.startsWith(prefix)) return undefined;


  if(config.ids.length > 0 && config.private){

    let usersArray = Array();

    config.ids.forEach(id => {
    let user = client.users.get(id)
    if(user) usersArray.push(user)
})
    return msg.reply(`Only bot owner(s) can use this bot [${usersArray.map(user => user.tag).join(', ')}]`)

  }


  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
const command = args.shift().toLowerCase();

    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';

    let cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))

    let s;

    let Ms = sub.split(' ')[1] == 'month' ? sub.split(' ')[0] * 30 : 1;

    if(sub.split(' ')[1] == 'month') s = 1000 * 60 * 60 * 24 * Ms;

    if(s - (Date.now() - regDate) <= 0 && cmd != undefined) return msg.reply('لقد انتهى الاشتراك في هذا البوت .')

    if(lang == 'ar' && cmd == 'اشتراكي') {

      moment.locale('ar-SA')

      let subb = sub.split(' ');

      let count = parseInt(subb.slice(0));
      let dur = subb.slice(1);

      let mss;

      let moMs = dur == 'month' ? count * 30 : 1;

      if(dur == 'month') mss = 1000 * 60 * 60 * 24 * moMs;


      let expDate = moment(regDate).add(count, dur);
      expDate = dateformat(expDate.toDate(), 'yyyy/mm/dd"-"hh:MM')
      let time = ms(mss - (Date.now() - regDate));

      let usersArray = Array();

      config.ids.forEach(id => {
      let user = client.users.get(id)
      if(user) usersArray.push(user)
  })

      msg.channel.send(`**تاريخ انتهاء الاشتراك : ${expDate}\nسينتهي اشتراكك بعد : ${time.months ? time.months : '0'} Months, ${time.days} Days, ${time.hours} Hours and ${time.minutes} Minutes\nتم تسجيل هذا البوت لـ : ${usersArray.map(user => user.tag).join(', ')}**`)

}


    if(lang == 'ar') {

      if(cmd === 'شغل') {
          const voiceChannel = msg.member.voiceChannel;
          if(!voiceChannel) return msg.channel.send(`:no_entry_sign: يجب أن تكون في **غرفة صوتية** قبل البدء`);
          const permissions = voiceChannel.permissionsFor(msg.client.user);
          if(!permissions.has('CONNECT')) {
              return msg.channel.send(':no_entry_sign: `CONNECT` لايمكنني دخول **الغرفة الصوتية** التي توجد بها أنت, أنا احتاج الى صلاحية');
          }

          if(!permissions.has('SPEAK')) {
              return msg.channel.send(':no_entry_sign: `SPEAK` لايمكنني التكلم في **الغرفة الصوتية** التي توجد بها أنت, أنا احتاج الى صلاحية');
          }

          if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
  			const playlist = await youtube.getPlaylist(url);
  			const videos = await playlist.getVideos();

  			for (const video of Object.values(videos)) {
  				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
  				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
  			}
  			return msg.channel.send(`:notes: الى طابور الموسيقى القادمة **${playlist.title}** تمت أضافة `);
  		} else {
  			try {

  				var video = await youtube.getVideo(url);
  			} catch (error) {
  				try {
  					var videos = await youtube.searchVideos(args, 1);

  					// eslint-disable-next-line max-depth
  					var video = await youtube.getVideoByID(videos[0].id);
  				} catch (err) {
  					console.error(err);
  					return msg.channel.send('**:new_moon_with_face: لا نتائج بحث**');
  				}
  			}

  			return handleVideo(video, msg, voiceChannel);
  		}

          async function handleVideo(video, msg, voiceChannel, playlist = false) {
  	const serverQueue = active.get(msg.guild.id);


  //	console.log('yao: ' + Util.escapeMarkdown(video.thumbnailUrl));

  let hrs = video.duration.hours > 0 ? (video.duration.hours > 9 ? `${video.duration.hours}:` : `0${video.duration.hours}:`) : '';
  let min = video.duration.minutes > 9 ? `${video.duration.minutes}:` : `0${video.duration.minutes}:`;
  let sec = video.duration.seconds > 9 ? `${video.duration.seconds}` : `0${video.duration.seconds}`;
  let dur = `${hrs}${min}${sec}`

    let ms = video.durationSeconds * 1000;

  	const song = {
  		id: video.id,
  		title: video.title,
      duration: dur,
      msDur: ms,
  		url: `https://www.youtube.com/watch?v=${video.id}`
  	};
  	if (!serverQueue) {
  		const queueConstruct = {
  			textChannel: msg.channel,
  			voiceChannel: voiceChannel,
  			connection: null,
  			songs: [],
  			volume: 50,
        requester: msg.author,
  			playing: true,
        repeating: false
  		};
  		active.set(msg.guild.id, queueConstruct);

  		queueConstruct.songs.push(song);

  		try {
  			var connection = await voiceChannel.join();
  			queueConstruct.connection = connection;
  			play(msg.guild, queueConstruct.songs[0]);
  		} catch (error) {
  			console.error(`I could not join the voice channel: ${error}`);
  			active.delete(msg.guild.id);
  			return msg.channel.send(`I cant join this voice channel`);
  		}
  	} else {
  		serverQueue.songs.push(song);

  		if (playlist) return undefined;
  		if(!args) return message.channel.send('**:new_moon_with_face: لا نتائج بحث**');
  		else return msg.channel.send(':watch: جاري البحث... [`' + args + '`]').then(m => {
        setTimeout(() => {//:watch: Loading... [let]
          m.edit(`:notes: **${serverQueue.songs.length}** الى طابور الموسيقى القادمة, طابور رقم` + '(`' + song.duration + '`)' + ` **${song.title}** تمت أضافة`);
        }, 500) // `:notes: **${serverQueue.songs.length}** الى طابور الموسيقى القادمة, طابور رقم` + '`(' + song.duration + ')`' ` **${song.title}**تمت أضافة`
      }) //:notes: Added FROZEN | Let It Go Sing-along | Official Disney UK (04:03)  to the queue at position 1
  	}
  	return undefined;
  }

  function play(guild, song) {
  	const serverQueue = active.get(guild.id);

  	if (!song) {
  		serverQueue.voiceChannel.leave();
  		active.delete(guild.id);
  		return;
  	}
    if(serverQueue.repeating) {
      serverQueue.textChannel.send(`**Repeating:** ${song.title}`);
    } else {
  	serverQueue.textChannel.send(':notes: Added **' + song.title + '** (`' + song.duration + '`) to begin playing.');
  }
  	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
  		.on('end', reason => {
  			//if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
  			//else console.log(reason);
        if(serverQueue.repeating) return play(guild, serverQueue.songs[0])
  			serverQueue.songs.shift();
  			play(guild, serverQueue.songs[0]);
  		})
  		.on('error', error => console.error(error));
  	dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);


  }
} else if(cmd === 'طفي') {
          if(msg.guild.me.voiceChannel !== msg.member.voiceChannel) return msg.channel.send(`You must be in ${msg.guild.me.voiceChannel.name}`)
          if(!msg.member.hasPermission('ADMINISTRATOR')) {
            msg.react('❌')
            return msg.channel.send('You don\'t have permission `ADMINSTRATOR`');
          }
          let queue = active.get(msg.guild.id);
          if(queue.repeating) return msg.channel.send('لا استطيع ان اقوم باطفاء الموسيقى ونظام التكرار يعمل, قم بكتابة ' + `\`${prefix}كرر\`` + ' لاطفاء نظام التكرار')
          queue.songs = [];
	  queue.connection.dispatcher.end();
          return msg.channel.send(':notes: The player has stopped and the queue has been cleared.');

      } else if(cmd === 'تخطي') {

        let vCh = msg.member.voiceChannel;

        let queue = active.get(msg.guild.id);

          if(!vCh) return msg.channel.send('Sorry, but you can\'t because you are not in voice channel');

          if(!queue) return msg.channel.send('No music playing to skip it');

          if(queue.repeating) return msg.channel.send('You can\'t skip it, because repeating mode is on, run ' + `\`${prefix}forceskip\``);

          let req = vCh.members.size - 1;

          if(req == 1) {
              msg.channel.send('**:notes: Skipped **' + args);
              return queue.connection.dispatcher.end('Skipping ..')
          }

          if(!queue.votes) queue.votes = [];

          if(queue.votes.includes(msg.member.id)) return msg.say(`You already voted for skip! ${queue.votes.length}/${req}`);

          queue.votes.push(msg.member.id);

          if(queue.votes.length >= req) {
              msg.channel.send('**:notes: Skipped **' + args);

              delete queue.votes;

              return queue.connection.dispatcher.end('Skipping ..')
          }

          msg.channel.send(`**You have successfully voted for skip! ${queue.votes.length}/${req}**`)

      } else if(cmd === 'وقف') {

        let queue = active.get(msg.guild.id);

          let vCh = msg.member.voiceChannel;

          if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(`You are not in my voice channel.`);

          if(!queue) {
              return msg.channel.send('No music playing to pause.')
          }

          if(!queue.playing) return msg.channel.send(':no_entry_sign: There must be music playing to use that!')

          let disp = queue.connection.dispatcher;

          disp.pause('Pausing..')

          queue.playing = false;

          msg.channel.send(':notes: Paused ' + args + '. **Type** `' + prefix + 'resume` to unpause!')

      } else if (cmd === 'كمل') {

        let queue = active.get(msg.guild.id);

          let vCh = msg.member.voiceChannel;

          if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(`You are not in my voice channel.`);

          if(!queue) return msg.channel.send(':notes: No music paused to resume.')

          if(queue.playing) return msg.channel.send(':notes: No music paused to resume.')

          let disp = queue.connection.dispatcher;

          disp.resume('Resuming..')

          queue.playing = true;

          msg.channel.send(':notes: Resumed ' + args + '.')

      } else if(cmd === 'صوت') {

        let queue = active.get(msg.guild.id);

        if(!queue || !queue.songs) return msg.channel.send(':notes: There is no music playing to set volume.');

        let vCh = msg.member.voiceChannel;

        if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(':notes: You are not in my voice channel');

        let disp = queue.connection.dispatcher;

        if(isNaN(args[0])) return msg.channel.send(':notes: Numbers only!');

        if(parseInt(args[0]) > 100) return msg.channel.send('You can\'t set the volume more than 100.')
  //:speaker: Volume changed from 20 to 20 ! The volume has been changed from ${queue.volume} to ${args[0]}
        msg.channel.send(':speaker: Volume has been **changed** from (`' + queue.volume + '`) to (`' + args[0] + '`)');

        queue.volume = args[0];

        disp.setVolumeLogarithmic(queue.volume / 100);

      } else if (cmd === 'قائمه') {

        let queue = active.get(msg.guild.id);

        if(!queue) return msg.channel.send(':no_entry_sign: There must be music playing to use that!');

        let embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username}`, client.user.displayAvatarURL)
        let text = '';

        for (var i = 0; i < queue.songs.length; i++) {
          let num;
          if((i) > 8) {
            let st = `${i+1}`
            let n1 = conv.toWords(st[0])
            let n2 = conv.toWords(st[1])
            num = `:${n1}::${n2}:`
          } else {
          let n = conv.toWords(i+1)
          num = `:${n}:`
        }
          text += `${num} ${queue.songs[i].title} [${queue.songs[i].duration}]\n`
        }
        embed.setDescription(`Songs Queue | ${msg.guild.name}\n\n ${text}`)
        msg.channel.send(embed)

      } else if(cmd === 'كرر') {

        let vCh = msg.member.voiceChannel;

        if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send('You are not in my voice channel');

        let queue = active.get(msg.guild.id);

        if(!queue || !queue.songs) return msg.channel.send('There is no music playing to repeat it.');

        if(queue.repeating) {
          queue.repeating = false;
          return msg.channel.send(':arrows_counterclockwise: **Repeating Mode** (`False`)');
        } else {
          queue.repeating = true;
          return msg.channel.send(':arrows_counterclockwise: **Repeating Mode** (`True`)');
        }

      } else if(cmd === 'forceskip') {

        let vCh = msg.member.voiceChannel;

        if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send('You are not in my voice channel');

        let queue = active.get(msg.guild.id);

        if(queue.repeating) {

          queue.repeating = false;

          msg.channel.send('ForceSkipped, Repeating mode is on.')

          queue.connection.dispatcher.end('ForceSkipping..')

          queue.repeating = true;

        } else {

          queue.connection.dispatcher.end('ForceSkipping..')

          msg.channel.send('ForceSkipped.')

        }

      } else if(cmd === 'تخطي-الى') {

        let vCh = msg.member.voiceChannel;

        if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send('You are not in my voice channel');

        let queue = active.get(msg.guild.id);

        if(!queue.songs || queue.songs < 2) return msg.channel.send('There is no music to skip to.');

      if(queue.repeating) return msg.channel.send('You can\'t skip, because repeating mode is on, run ' + `\`${prefix}repeat\` to turn off.`);

        if(!args[0] || isNaN(args[0])) return msg.channel.send('Please input song number to skip to it, run ' + prefix + `queue` + ' to see songs numbers.');

        let sN = parseInt(args[0]) - 1;

        if(!queue.songs[sN]) return msg.channel.send('There is no song with this number.');

        let i = 1;

        msg.channel.send(`Skipped to: **${queue.songs[sN].title}[${queue.songs[sN].duration}]**`)

        while (i < sN) {
          i++;
          queue.songs.shift();
        }

        queue.connection.dispatcher.end('SkippingTo..')

      } else if(cmd === 'الان') {

        let q = active.get(msg.guild.id);

        let now = npMsg(q)

        msg.channel.send(now.mes, now.embed)
        .then(me => {
          setInterval(() => {
            let noww = npMsg(q)
            me.edit(noww.mes, noww.embed)
          }, 5000)
        })

        function npMsg(queue) {

          let m = !queue || !queue.songs[0] ? 'No music playing.' : "Now Playing..."

        const eb = new Discord.RichEmbed();

        eb.setColor(msg.guild.me.displayHexColor)

        if(!queue || !queue.songs[0]){

          eb.setTitle("No music playing");
              eb.setDescription("\u23F9 "+bar(-1)+" "+volumeIcon(!queue?100:queue.volume));
        } else if(queue.songs) {

          if(queue.requester) {

            let u = msg.guild.members.get(queue.requester.id);

            if(!u)
              eb.setAuthor('Unkown (ID:' + queue.requester.id + ')')
            else
              eb.setAuthor(u.user.tag, u.user.displayAvatarURL)
          }

          if(queue.songs[0]) {
          try {
              eb.setTitle(queue.songs[0].title);
              eb.setURL(queue.songs[0].url);
          } catch (e) {
            eb.setTitle(queue.songs[0].title);
          }
  }
          eb.setDescription(embedFormat(queue))

        }

        return {
          mes: m,
          embed: eb
        }

      }

        function embedFormat(queue) {

          if(!queue || !queue.songs) {
            return "No music playing\n\u23F9 "+bar(-1)+" "+volumeIcon(100);
          } else if(!queue.playing) {
            return "No music playing\n\u23F9 "+bar(-1)+" "+volumeIcon(queue.volume);
          } else {

            let progress = (queue.connection.dispatcher.time / queue.songs[0].msDur);
            let prog = bar(progress);
            let volIcon = volumeIcon(queue.volume);
            let playIcon = (queue.connection.dispatcher.paused ? "\u23F8" : "\u25B6")
            let dura = queue.songs[0].duration;

            return playIcon + ' ' + prog + ' `[' + formatTime(queue.connection.dispatcher.time) + '/' + dura + ']`' + volIcon;


          }

        }

        function formatTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return (hours > 0 ? hours + ":" : "") + minutes + ":" + seconds;
  }

        function bar(precent) {

          var str = '';

          for (var i = 0; i < 12; i++) {

            let pre = precent
            let res = pre * 12;

            res = parseInt(res)

            if(i == res){
              str+="\uD83D\uDD18";
            }
            else {
              str+="▬";
            }
          }

          return str;

        }

        function volumeIcon(volume) {

          if(volume == 0)
             return "\uD83D\uDD07";
         if(volume < 30)
             return "\uD83D\uDD08";
         if(volume < 70)
             return "\uD83D\uDD09";
         return "\uD83D\uDD0A";

        }

      }

    }

    if(lang == 'en') {

    if(cmd === 'play') {
        const voiceChannel = msg.member.voiceChannel;
        if(!voiceChannel) return msg.channel.send(`:no_entry_sign: You must be listening in a voice channel to use that!`);
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if(!permissions.has('CONNECT')) {
            return msg.channel.send(`:no_entry_sign: I can't join Your voiceChannel because i don't have ` + '`' + '`CONNECT`' + '`' + ` permission!`);
        }

        if(!permissions.has('SPEAK')) {
            return msg.channel.send(`:no_entry_sign: I can't SPEAK in your voiceChannel because i don't have ` + '`' + '`SPEAK`' + '`' + ` permission!`);
        }

        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();

			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return msg.channel.send(`Added to queue: ${playlist.title}`);
		} else {
			try {

				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(args, 1);

					// eslint-disable-next-line max-depth
					var video = await youtube.getVideoByID(videos[0].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('I can\'t find any thing');
				}
			}

			return handleVideo(video, msg, voiceChannel);
		}

        async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = active.get(msg.guild.id);


//	console.log('yao: ' + Util.escapeMarkdown(video.thumbnailUrl));

let hrs = video.duration.hours > 0 ? (video.duration.hours > 9 ? `${video.duration.hours}:` : `0${video.duration.hours}:`) : '';
let min = video.duration.minutes > 9 ? `${video.duration.minutes}:` : `0${video.duration.minutes}:`;
let sec = video.duration.seconds > 9 ? `${video.duration.seconds}` : `0${video.duration.seconds}`;
let dur = `${hrs}${min}${sec}`

  let ms = video.durationSeconds * 1000;

	const song = {
		id: video.id,
		title: video.title,
    duration: dur,
    msDur: ms,
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 50,
      requester: msg.author,
			playing: true,
      repeating: false
		};
		active.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			active.delete(msg.guild.id);
			return msg.channel.send(`I cant join this voice channel`);
		}
	} else {
		serverQueue.songs.push(song);

		if (playlist) return undefined;
		if(!args) return message.channel.send('no results.');
		else return msg.channel.send(':watch: Loading... [`' + args + '`]').then(m => {
      setTimeout(() => {//:watch: Loading... [let]
        m.edit(`:notes: Added **${song.title}**` + '(` ' + song.duration + ')`' + ` to the queue at position ` + `${serverQueue.songs.length}`);
      }, 500)
    }) //:notes: Added FROZEN | Let It Go Sing-along | Official Disney UK (04:03)  to the queue at position 1
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = active.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		active.delete(guild.id);
		return;
	}
	//console.log(serverQueue.songs);
  if(serverQueue.repeating) {
    serverQueue.textChannel.send(`**Repeating:** ${song.title}`);
  } else {
	serverQueue.textChannel.send(':notes: Added **' + song.title + '** (`' + song.duration + '`) to begin playing.');
}
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			//if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			//else console.log(reason);
      if(serverQueue.repeating) return play(guild, serverQueue.songs[0])
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);


}
} else if(cmd === 'stop') {
        if(msg.guild.me.voiceChannel !== msg.member.voiceChannel) return msg.channel.send(`You must be in ${msg.guild.me.voiceChannel.name}`)
        if(!msg.member.hasPermission('ADMINISTRATOR')) {
          msg.react('❌')
          return msg.channel.send('You don\'t have permission `ADMINSTRATOR`');
        }
        let queue = active.get(msg.guild.id);
          queue.songs = [];
	  queue.connection.dispatcher.end()
        return msg.channel.send(':notes: The player has stopped and the queue has been cleared.');

    } else if(cmd === 'skip') {

      let vCh = msg.member.voiceChannel;

      let queue = active.get(msg.guild.id);

        if(!vCh) return msg.channel.send('Sorry, but you can\'t because you are not in voice channel');

        if(!queue) return msg.channel.send('No music playing to skip it');

        if(queue.repeating) return msg.channel.send('You can\'t skip it, because repeating mode is on, run ' + `\`${prefix}forceskip\``);

        let req = vCh.members.size - 1;

        if(req == 1) {
            msg.channel.send('**:notes: Skipped **' + args);
            return queue.connection.dispatcher.end('Skipping ..')
        }

        if(!queue.votes) queue.votes = [];

        if(queue.votes.includes(msg.member.id)) return msg.say(`You already voted for skip! ${queue.votes.length}/${req}`);

        queue.votes.push(msg.member.id);

        if(queue.votes.length >= req) {
            msg.channel.send('**:notes: Skipped **' + args);

            delete queue.votes;

            return queue.connection.dispatcher.end('Skipping ..')
        }

        msg.channel.send(`**You have successfully voted for skip! ${queue.votes.length}/${req}**`)

    } else if(cmd === 'pause') {

      let queue = active.get(msg.guild.id);

        let vCh = msg.member.voiceChannel;

        if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(`You are not in my voice channel.`);

        if(!queue) {
            return msg.channel.send('No music playing to pause.')
        }

        if(!queue.playing) return msg.channel.send(':no_entry_sign: There must be music playing to use that!')

        let disp = queue.connection.dispatcher;

        disp.pause('Pausing..')

        queue.playing = false;

        msg.channel.send(':notes: Paused ' + args + '. **Type** `' + prefix + 'resume` to unpause!')

    } else if (cmd === 'resume') {

      let queue = active.get(msg.guild.id);

        let vCh = msg.member.voiceChannel;

        if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(`You are not in my voice channel.`);

        if(!queue) return msg.channel.send(':notes: No music paused to resume.')

        if(queue.playing) return msg.channel.send(':notes: No music paused to resume.')

        let disp = queue.connection.dispatcher;

        disp.resume('Resuming..')

        queue.playing = true;

        msg.channel.send(':notes: Resumed ' + args + '.')

    } else if(cmd === 'volume') {

      let queue = active.get(msg.guild.id);

      if(!queue || !queue.songs) return msg.channel.send(':notes: There is no music playing to set volume.');

      let vCh = msg.member.voiceChannel;

      if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(':notes: You are not in my voice channel');

      let disp = queue.connection.dispatcher;

      if(isNaN(args[0])) return msg.channel.send(':notes: Numbers only!');

      if(parseInt(args[0]) > 100) return msg.channel.send('You can\'t set the volume more than 100.')
//:speaker: Volume changed from 20 to 20 ! The volume has been changed from ${queue.volume} to ${args[0]}
      msg.channel.send(':speaker: Volume has been **changed** from (`' + queue.volume + '`) to (`' + args[0] + '`)');

      queue.volume = args[0];

      disp.setVolumeLogarithmic(queue.volume / 100);

    } else if (cmd === 'queue') {

      let queue = active.get(msg.guild.id);

      if(!queue) return msg.channel.send(':no_entry_sign: There must be music playing to use that!');

      let embed = new Discord.RichEmbed()
      .setAuthor(`${client.user.username}`, client.user.displayAvatarURL)
      let text = '';

      for (var i = 0; i < queue.songs.length; i++) {
        let num;
        if((i) > 8) {
          let st = `${i+1}`
          let n1 = conv.toWords(st[0])
          let n2 = conv.toWords(st[1])
          num = `:${n1}::${n2}:`
        } else {
        let n = conv.toWords(i+1)
        num = `:${n}:`
      }
        text += `${num} ${queue.songs[i].title} [${queue.songs[i].duration}]\n`
      }
      embed.setDescription(`Songs Queue | ${msg.guild.name}\n\n ${text}`)
      msg.channel.send(embed)

    } else if(cmd === 'repeat') {

      let vCh = msg.member.voiceChannel;

      if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send('You are not in my voice channel');

      let queue = active.get(msg.guild.id);

      if(!queue || !queue.songs) return msg.channel.send('There is no music playing to repeat it.');

      if(queue.repeating) {
        queue.repeating = false;
        return msg.channel.send(':arrows_counterclockwise: **Repeating Mode** (`False`)');
      } else {
        queue.repeating = true;
        return msg.channel.send(':arrows_counterclockwise: **Repeating Mode** (`True`)');
      }

    } else if(cmd === 'forceskip') {

      let vCh = msg.member.voiceChannel;

      if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send('You are not in my voice channel');

      let queue = active.get(msg.guild.id);

      if(queue.repeating) {

        queue.repeating = false;

        msg.channel.send('ForceSkipped, Repeating mode is on.')

        queue.connection.dispatcher.end('ForceSkipping..')

        queue.repeating = true;

      } else {

        queue.connection.dispatcher.end('ForceSkipping..')

        msg.channel.send('ForceSkipped.')

      }

    } else if(cmd === 'skipto') {

      let vCh = msg.member.voiceChannel;

      if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send('You are not in my voice channel');

      let queue = active.get(msg.guild.id);

      if(!queue.songs || queue.songs < 2) return msg.channel.send('There is no music to skip to.');

    if(queue.repeating) return msg.channel.send('You can\'t skip, because repeating mode is on, run ' + `\`${prefix}repeat\` to turn off.`);

      if(!args[0] || isNaN(args[0])) return msg.channel.send('Please input song number to skip to it, run ' + prefix + `queue` + ' to see songs numbers.');

      let sN = parseInt(args[0]) - 1;

      if(!queue.songs[sN]) return msg.channel.send('There is no song with this number.');

      let i = 1;

      msg.channel.send(`Skipped to: **${queue.songs[sN].title}[${queue.songs[sN].duration}]**`)

      while (i < sN) {
        i++;
        queue.songs.shift();
      }

      queue.connection.dispatcher.end('SkippingTo..')

    } else if(cmd === 'nowplaying') {

      let q = active.get(msg.guild.id);

      let now = npMsg(q)

      msg.channel.send(now.mes, now.embed)
      .then(me => {
        setInterval(() => {
          let noww = npMsg(q)
          me.edit(noww.mes, noww.embed)
        }, 5000)
      })

      function npMsg(queue) {

        let m = !queue || !queue.songs[0] ? 'No music playing.' : "Now Playing..."

      const eb = new Discord.RichEmbed();

      eb.setColor(msg.guild.me.displayHexColor)

      if(!queue || !queue.songs[0]){

        eb.setTitle("No music playing");
            eb.setDescription("\u23F9 "+bar(-1)+" "+volumeIcon(!queue?100:queue.volume));
      } else if(queue.songs) {

        if(queue.requester) {

          let u = msg.guild.members.get(queue.requester.id);

          if(!u)
            eb.setAuthor('Unkown (ID:' + queue.requester.id + ')')
          else
            eb.setAuthor(u.user.tag, u.user.displayAvatarURL)
        }

        if(queue.songs[0]) {
        try {
            eb.setTitle(queue.songs[0].title);
            eb.setURL(queue.songs[0].url);
        } catch (e) {
          eb.setTitle(queue.songs[0].title);
        }
}
        eb.setDescription(embedFormat(queue))

      }

      return {
        mes: m,
        embed: eb
      }

    }

      function embedFormat(queue) {

        if(!queue || !queue.songs) {
          return "No music playing\n\u23F9 "+bar(-1)+" "+volumeIcon(100);
        } else if(!queue.playing) {
          return "No music playing\n\u23F9 "+bar(-1)+" "+volumeIcon(queue.volume);
        } else {

          let progress = (queue.connection.dispatcher.time / queue.songs[0].msDur);
          let prog = bar(progress);
          let volIcon = volumeIcon(queue.volume);
          let playIcon = (queue.connection.dispatcher.paused ? "\u23F8" : "\u25B6")
          let dura = queue.songs[0].duration;

          return playIcon + ' ' + prog + ' `[' + formatTime(queue.connection.dispatcher.time) + '/' + dura + ']`' + volIcon;


        }

      }

      function formatTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return (hours > 0 ? hours + ":" : "") + minutes + ":" + seconds;
}

      function bar(precent) {

        var str = '';

        for (var i = 0; i < 12; i++) {

          let pre = precent
          let res = pre * 12;

          res = parseInt(res)

          if(i == res){
            str+="\uD83D\uDD18";
          }
          else {
            str+="▬";
          }
        }

        return str;

      }

      function volumeIcon(volume) {

        if(volume == 0)
           return "\uD83D\uDD07";
       if(volume < 30)
           return "\uD83D\uDD08";
       if(volume < 70)
           return "\uD83D\uDD09";
       return "\uD83D\uDD0A";

      }

    }

  }
});




//admin

const devs = ["449313863494664214", "228401267263668224"];



client.on('message', message => {



    let argresult = message.content.split(` `).slice(1).join(' ');
    if (message.content.startsWith(prefix + 'setStreaming')) {
      if (!devs.includes(message.author.id)) return message.channel.send("<@449313863494664214> only this guy can do restart the bot so don't try again :wink:.");
      message.delete();
      client.user.setGame(argresult, 'https://twitch.tv/DynastyShop');

    } else if(message.content.startsWith(prefix + 'setWatching')) {
        client.user.setActivity(argresult,{type: 'WATCHING'});

      } else if(message.content.startsWith(prefix + 'setListening')) {
        client.user.setActivity(argresult,{type: 'LISTENING'});

      } else if(message.content.startsWith(prefix + 'setPlaying')) {
        client.user.setActivity(argresult,{type: 'PLAYING'});

      } else if(message.content.startsWith(prefix + 'setName')) {
        client.user.setUsername(argresult);

      } else if(message.content.startsWith(prefix + 'setAvatar')) {
        client.user.setAvatar(argresult);


      } else if(message.content.startsWith(prefix + 'setStatus')) {
        if(!argresult) return message.channel.send('`online`, `DND(Do not Distrub),` `idle`, `invisible(Offline)` :notes: أختر أحد الحالات');
        client.user.setStatus(argresult);


    }

  });

client.on('message', message => {
  if(lang == 'ar') {
  var helplist = `**${client.user.tag}** commands:

  ` + '`' + prefix + 'عن` - **شرح معلومات البوت**' + `
  ` + '`' + prefix + 'سرعه` - **سرعه البوت**' + `


  :notes: __**أوامر الموسيقى**__` + `
  ` + '`' + prefix + 'شغل` - **لتشغيل الموسيقى**' + `
  ` + '`' + prefix + 'تخطي` - **لتصويت تخطي الأغنية**' + `
  ` + '`' + prefix + 'طفي` - **لأيقاف الأغنية وخروج البوت من الروم**' + `
  ` + '`' + prefix + 'وقف` - **لأيقاف الاغنية بشكل مؤقت**' + `
  ` + '`' + prefix + 'كمل` - **لأكمال تشغيل الأغنية المؤقة مؤقتاً**' + `
  ` + '`' + prefix + 'صوت` - **لتغيير مستوى الصوت**' + `
  ` + '`' + prefix + 'قائمه` - **لمشاهدة طابور الموسيقى**' + `
  ` + '`' + prefix + 'كرر` - **لأعادة تشغيل الاغنية كل ما تنتهي مباشرتاً**' + `
  ` + '`' + prefix + 'الان` - **لأعادة تشغيل الاغنية كل ما تنتهي مباشرتاً**' + `



  :watch: __**أوامر صاحب البوت**__` + `
  ` + '`' + prefix + 'setStreaming` - **لجعل وضع البوت ستريمنق**' + `
  ` + '`' + prefix + 'setWatching` - **لجعل وضع البوت واتشنق**' + `
  ` + '`' + prefix + 'setListening` - **لجعل وضع البوت ليستننق**' + `
  ` + '`' + prefix + 'setName` - **لتغيير أسم البوت**' + `
  ` + '`' + prefix + 'setAvatar` - **لتغيير صورة البوت**' + `
  ` + '`' + prefix + 'setStatus` - **لتغيير حالة البوت**' + `


 __**صاحب البوت**__ : <@228401267263668224>, <@449313863494664214>

 **جميع الحقوق محفوظة ألى متجر بتر ستور
 BetterStore..**`
  if(message.content === prefix + 'help') {
    message.author.send(helplist);
  }
}
});

client.login(token);
