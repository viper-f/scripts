export default class MybbAPI {
    maxSkip = 1000;
    maxLimit = 100;
    entityTypes = {
        board: {
            method: 'board.get',
            fields: [
                "board_id",
                "board_cat",
                "founded",
                "timezone_offset",
                "title",
                "total_users",
                "total_topics",
                "total_posts",
                "num_categories",
                "num_forums",
                "last_registered_user_id",
                "last_registered_username",
                "active_guests",
                "active_users",
                "active_users_record",
                "active_users_record_datetime",
                "users_24h_record",
                "users_24h_record_datetime",
                "o_default_style",
                "o_user_style",
                "o_foundation",
                "o_announcement",
                "o_show_user_info",
                "o_show_users_online",
                "o_show_24h_users",
                "o_show_birthdays",
                "o_show_other_statistics",
                "o_search_forums",
                "o_post_rating",
                "o_avatars",
                "o_subscriptions",
                "o_relation",
                "o_relation_type",
                "o_positive",
                "o_registration",
                "o_registration_by_invitation",
                "o_limit_post_count"
            ],
            filters: ["id", "cat_id", "exclude"],
            sortFields: []
        },
        forum: {
            method: 'board.getForums',
            fields: [],
            filters: ["id", "cat_id", "exclude"],
            sortFields: []
        },
        fund: {
            method: 'board.getFunds',
            fields: [],
            filers: [],
            sortFields: []
        },
        subscription: {
            method: 'board.getSubscriptions',
            fields: [],
            filers: ["user_id", "topic_id"],
            sortFields: ["id", "subject", "num_replies", "num_posts"]
        },
        file: {
            method: 'board.getFileMetadata',
            fields: [],
            filers: ["filename", "admin"],
            sortFields: []
        },
        user: {
            method: 'users.get',
            fields: [
                "user_id",
                "username",
                "group_id",
                "avatar",
                "registered",
                "num_posts",
                "title",
                "group_title",
                "group_user_title",
                "realname",
                "sex",
                "age",
                "birth_date",
                "website",
                "location",
                "invited_user_id",
                "num_invites",
                "time_spent",
                "last_visit",
                "respect_plus",
                "respect_minus",
                "positive_plus",
                "positive_minus",
                "last_post",
                "signature",
                "o_style"
            ],
            filters: ["user_id", "username", "group_id", "birth_month"],
            sortFields: [
                "user_id",
                "username",
                "registered",
                "last_visit",
                "respect",
                "positive",
                "num_invites",
                "birthdate",
                "num_posts"
            ]
        },
        topic: {
            method: 'topic.get',
            fields: [
                "id",
                "subject",
                "last_user_id",
                "last_username",
                "last_post_id",
                "last_post_date",
                "username",
                "posted",
                "forum_id",
                "closed",
                "sticky",
                "first_post",
                "init_post",
                "avatar",
                "num_replies",
                "num_views",
                "init_post"
            ],
            filters: ["forum_id", "topic_id", "exclude_forum", "sticky_first"],
            sortFields: ["id", "posted", "last_post"]
        },
        post: {
            method: 'post.get',
            fields: [
                "id",
                "rating",
                "message",
                "subject",
                "user_id",
                "username",
                "posted",
                "topic_id",
                "forum_id",
                "avatar",
                "signature",
                "num_replies",
                "num_views",
                "edited",
                "edited_by",
                "perm",
                "vote_code",
                "last_visit",
                "is_online"
            ],
            filters: ["post_id", "topic_id"],
            sortFields: ["id", "posted"]
        }
    }

    getByIdList = {
        user: "user_id",
        topic: "topic_id",
        post: "post_id"
    }


    toTimestamp(strDate) {
        const dt = Date.parse(strDate);
        return dt / 1000;
    }

    dateFormat(timestamp) {
        var a = new Date(timestamp * 1000);
        var year = a.getFullYear();
        var month = ("00"+(a.getMonth() +1)).slice(-2);
        var date = ("00"+a.getDate()).slice(-2);
        var hour = ("00"+a.getHours()).slice(-2);
        var min = ("00"+a.getMinutes()).slice(-2);
        var sec = ("00"+a.getSeconds()).slice(-2);
        return year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
    }

    async getUserById(id, fields = null) {
        return await this.getById('user', id, fields);
    }

    async getTopicById(id, fields = null) {
        return await this.getById('topic', id, fields);
    }

    async getPostById(id, fields = null) {
        return await this.getById('post', id, fields);
    }

    async getById(entityType, id, fields = null) {
        if (!Object.keys(this.getByIdList).includes(entityType)) {
            throw new Error('This type is not supported');
        }
        const filters = {}
        filters[this.getByIdList[entityType]] = id;
        if (fields === null) {
            fields = this.entityTypes[entityType].fields;
        }
        const rows = await this.apiCall(this.entityTypes[entityType].method, filters,
            fields);
        return rows[0];
    }

    async findTopics(filters = null, fields = [], sortBy = null, sortDir = null, limit = null) {
        return await this.findAll('topic', filters, fields, sortBy, sortDir, limit);
    }

    async findPosts(filters = null, fields = [], sortBy = null, sortDir = null, limit = null) {
        return await this.findAll('post', filters, fields, sortBy, sortDir, limit);
    }

    async findUsers(filters = null, fields = [], sortBy = null, sortDir = null, limit = null) {
        return await this.findAll('user', filters, fields, sortBy, sortDir, limit);
    }

    /**
     * @param nativeFilters - {key1: value1, key2: value2}
     * @param additionalFilters = {key1: {op: (eq,lte,gte,lt,gt), value: val1}}
     * @param fields
     * @param sortBy
     * @param sortDir
     * @param limit
     * @returns {Promise<*[]>}
     */
    async findFilteredTopics( nativeFilters = null,
                              additionalFilters = null,
                              fields = [],
                              sortBy = null,
                              sortDir = null,
                              limit = null) {
        return this.findFiltered('topic', nativeFilters, additionalFilters, fields, sortBy, sortDir, limit);
    }

    /**
     * @param nativeFilters - {key1: value1, key2: value2}
     * @param additionalFilters = {key1: {op: (eq,lte,gte,lt,gt), value: val1}}
     * @param fields
     * @param sortBy
     * @param sortDir
     * @param limit
     * @returns {Promise<*[]>}
     */
    async findFilteredPosts( nativeFilters = null,
                              additionalFilters = null,
                              fields = [],
                              sortBy = null,
                              sortDir = null,
                              limit = null) {
        return this.findFiltered('post', nativeFilters, additionalFilters, fields, sortBy, sortDir, limit);
    }

    /**
     * @param nativeFilters - {key1: value1, key2: value2}
     * @param additionalFilters = {key1: {op: (eq,lte,gte,lt,gt), value: val1}}
     * @param fields
     * @param sortBy
     * @param sortDir
     * @param limit
     * @returns {Promise<*[]>}
     */
    async findFilteredUsers( nativeFilters = null,
                              additionalFilters = null,
                              fields = [],
                              sortBy = null,
                              sortDir = null,
                              limit = null) {
        return this.findFiltered('user', nativeFilters, additionalFilters, fields, sortBy, sortDir, limit);
    }

    /**
     * @param entityType
     * @param nativeFilters - {key1: value1, key2: value2}
     * @param additionalFilters = {key1: {op: (eq,lte,gte,lt,gt), value: val1}}
     * @param fields
     * @param sortBy
     * @param sortDir
     * @param limit
     * @returns {Promise<*[]>}
     */
    async findFiltered(entityType,
                       nativeFilters = null,
                       additionalFilters = null,
                       fields = [],
                       sortBy = null,
                       sortDir = null,
                       limit = null) {

        this.validateRequest(entityType, nativeFilters, fields, sortBy)

        const schema = this.entityTypes[entityType];
        for (const additionalFilterKey of Object.keys(additionalFilters)) {
            if(!schema.fields.includes(additionalFilterKey)) {
                throw new Error('Incorrect filtering field '+additionalFilterKey);
            }
        }

        fields = fields.concat(Object.keys(additionalFilters))

        const queryLimit = limit ?? this.maxLimit;
        limit = limit ?? this.maxSkip;
        let offset = 0
        let rows = [1]
        let result = []
        while(rows.length && offset < this.maxSkip && result.length < limit) {
            rows = await this.apiCall(this.entityTypes[entityType].method, nativeFilters,
                fields, sortBy, sortDir, offset, queryLimit);
            offset += queryLimit
            rows.map((row) => {
                let add = true;
                for (const [key, filter] of Object.entries(additionalFilters)) {
                    if (!this.checkFilter(filter, row[key])) {
                        add = false;
                        break;
                    }
                }
                if (add) {
                    result.push(row)
                }
            })
        }
        return result;
    }

    checkFilter(filter, value) {
        if(typeof filter['value'] === 'number') {
            value = parseInt(value)
        }
        console.log(filter)
        console.log(value)
        switch(filter['op']) {
            case 'eq':
                return value === filter['value']
            case 'gt':
                return value > filter['value']
            case 'lt':
                return value < filter['value']
            case 'gte':
                return value >= filter['value']
            case 'lte':
                return value <= filter['value']
        }
        throw new Error('Unsupported operand type')
    }

    async findAll(entityType,
                  filters = null,
                  fields = [],
                  sortBy = null,
                  sortDir = null,
                  limit = null)
    {
        this.validateRequest(entityType, filters, fields, sortBy);
        const queryLimit = limit ?? this.maxLimit;
        const totalLimit = limit ?? this.maxSkip;
        let offset = 0
        let rows = [1]
        let result = []
        while(rows.length && offset < totalLimit) {
            rows = await this.apiCall(this.entityTypes[entityType].method, filters,
                fields, sortBy, sortDir, offset, queryLimit);
            offset += queryLimit
            Array.prototype.push.apply(result,rows)
        }
        return result
    }

    validateRequest(entityType, filters = null, fields = [], sortBy = null) {
        const schema = this.entityTypes[entityType];
        if (!schema) {
            throw new Error('Unsupported type');
        }

        let errors = []

        for (const filter of Object.keys(filters)) {
            if (!schema.filters.includes(filter)) {
                errors.push('Unsupported filter '+filter);
            }
        }

        for (const field of fields) {
            if (!schema.fields.includes(field)) {
                errors.push('Unsupported field '+field);
            }
        }


        if (sortBy && !schema.sortFields.includes(sortBy)) {
            errors.push('Unsupported sort field '+sortBy);
        }


        if (errors.length) {
            throw new Error(errors.join("\n"))
        }
    }

    /**
     *
     * @returns {Promise<void>}
     * @param method - string
     * @param filters - object
     * @param fields - array
     * @param sortBy - string
     * @param sortDir - ASC/DESC
     * @param skip - number, max 1000
     * @param limit - number, default 50, max 100
     */
    async apiCall(method, filters = null, fields = [], sortBy = null, sortDir = null, skip = null, limit = null) {
        const response = await fetch(this.combineUrl(method, filters, fields, sortBy, sortDir, skip, limit))
        const j = await response.json()
        return j['response']
        //  return response.json()
    }

    combineUrl(method, filters = null, fields = [], sortBy = null, sortDir = null, skip = null, limit = null)
    {
        let url = '/api.php?method='+method;
        if (filters) {
            for (let [key, value] of Object.entries(filters)) {
                if(value instanceof Array) {
                    value = value.join(',')
                }
                url += '&' + key + '=' + value;
            }
        }
        if (fields.length) {
            url += '&fields=' + fields.join(',')
        }

        if (sortBy != null) {
            url += '&sort_by='+sortBy;
        }

        if (sortDir != null) {
            url += '&sort_dir='+sortDir;
        }
        if (skip !== null) {
            url += '&skip='+skip;
        }
        if (limit !== null) {
            url += '&limit='+limit;
        }
        return url;
    }

    formTopicUrl(id) {
        return '/viewtopic.php?id='+id;
    }

    formPostUrl(id) {
        return `/viewtopic.php?pid=${id}#p${id}`
    }

}
