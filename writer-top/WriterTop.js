class WriterTop {
    constructor(forums, startDate) {
        this.forumIds = forums;
        this.startDate = startDate;
        this.users = {}
        this.posts = {}
    }

    async execute() {
        await this.processTopics();
        this.render();
    }

    render() {
        let html = '';
        const users = Object.entries(this.users).values();
        users.sort((a, b) => {
            if (a.count > b.count) return 1;
            if (a.count < b.count) return -1;
            if (a.count === b.count) return 0;
        })
        users.forEach((user) => {
            const userPosts = this.posts[user['user_id']];
            html += `<div><span>${user['name']}</span><span>${user['count']}</span><span><ul>`;
            userPosts.forEach((post) => {
                html += `<li><a href="/viewtopic.php?pid=${post['id']}">${post['subject']} (${post['posted']})</a></li>`
            })
            html += `</ul></span></div>`
        })
        return html;
    }

    async processTopics() {
        const topicData = this.forumIds.flat(async (forumId) => {
            return await this.apiCall('topic.get', {"forum_id": forumId}, ["id", "init_post", "last_post_date"])
        })

        await Promise.all(topicData.forEach(async (topicDatum) => {
            this.findPosts(topicDatum['id'], topicDatum['init_post']);
        }))
    }

    async findPosts(topicId, initPostId) {
        const postData = await this.apiCall('post.get', {"topic_id": topicId},
            ["id", "user_id", "subject", "posted"], 'posted');
        let c = true;
        let i = 0;
        while (c && i < postData.length) {
            const postDatum = postData[i];
            if (postDatum['posted'] < this.startDate && postDatum['id'] !== initPostId) {
                if (this.users['user_id']) {
                    this.users['user_id'] = {
                        "user_id": postDatum['user_id'],
                        "user_name": postDatum['username'],
                        "count": 0
                    };
                    this.posts[postDatum['user_id']] = [];
                }
                this.users[postDatum['user_id']].count += 1;
                this.posts[postDatum['user_id']].push({
                    "post_id": postDatum['post_id'],
                    "user_id": postDatum['user_id'],
                    "subject": postDatum['subject'],
                    "posted": postDatum['posted']
                })
                i += 1;
            } else {
                c = false;
            }
        }
    }

    /**
     *
     * @returns {Promise<void>}
     * @param method - string
     * @param filters - object
     * @param fields - array
     * @param sortBy = string
     */
    async apiCall(method, filters = null, fields = [], sortBy = null) {
        let url = '/api.php?method='+method;
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                url += '&' + key + '=' + value;
            }
        }
        if (fields.length) {
            url += '&fields=' + fields.join(',')
        }

        if (sortBy) {
            url += '&sort_by='+sortBy;
        }

        fetch(url).then((response) => {
            return response
        })
    }
}