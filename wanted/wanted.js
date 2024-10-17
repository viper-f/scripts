import MybbAPI from 'https://forumstatic.ru/files/001b/f1/83/28631.js';

class WantedTable {
    parseMessage(t) {
        return {
            name: t.match(/\[name\](.*)\[\/name\]/)[1],
            image: t.match(/\[image\](.*)\[\/image\]/)[1],
            text: t.match(/\[text\](.*)\[\/text\]/)[1],
            post: t.match(/\[post\](.*)\[\/post\]/)[1]
        };
    }

    renderWanted(arr) {
        let h = '<span className="persons_title">нужные персонажи</span>';
        for (const elem of arr) {
            const letter = elem['name'].slice(0, 1);
            h += `<a href="${elem['post']}" className="persons-ava" name-letter="${letter}" title="${elem['text']}">
<div><img src="${elem['image']}"/></div></a>`;
        }
        document.getElementById('persons_wrap').innerHTML = h;
    }

    async getRandom(topic_id, number) {
        const mybb_api = new MybbAPI();
        let max = await mybb_api.getTopicById(topic_id, ['num_replies']);
        max = max['num_replies'];
        console.log(max);
        let post_numbers = [];
        let i = 0;
        while (i < number) {
            const n = this.randomIntFromInterval(1, max);
            if (!post_numbers.includes(n)) {
                post_numbers.push(n);
                i++;
            }
        }
        console.log(post_numbers);
        const all_posts = await mybb_api.findAll(
            'post',
            {"topic_id": topic_id},
            ['message']
        );
        console.log(all_posts);
        let posts = [];
        for (const post_number of post_numbers) {
            posts.push(all_posts[post_number]);
        }
        return posts;
    }

    randomIntFromInterval(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async show(topic_id, number) {
        const posts = await this.getRandom(topic_id, number);
        console.log(posts);
        const parsed = posts.map((post) => this.parseMessage(post['message']));
        this.renderWanted(parsed);
    }
}

