Ссылка на офоциальную документацию по API - https://mybb.ru/forumapi  

Найти один элемент по ID
--------------------------
```async getById(entityType, id, fields = null) ```  

Обертки над методом:  
```async getUserById(id, fields = null)```  
```async getTopicById(id, fields = null)```  
```async getPostById(id, fields = null)```  

Выбрать элементы, используя стандартные фильтры
-----------------------------------------------
Стандартные фильтры можно найти на странице официальной 
документации. Они находятся в таблицах параметров.

```js
async findAll(
              entityType, 
              filters = null, 
              fields = [], 
              sortBy = null,  
              sortDir = null, 
              limit = null
              )
 ```
```filters``` - объект. Пример:
```js
{
forum_id: 12,
topic_id: [1, 2, 3, 4]
}
```

```fields``` - массив полей
```sortBy``` - текстовое поле. Внимание! 
В редких случая названия полей для сортировки не совпадают 
с названиями полей для выборки. Сверяйтесь с документацией!   
```sortDir``` - направление сортировки. ASC - от меьншего к большему, DESC - от большего к меньшему.  
```limit``` - предел количества выбранных элементов. Максимальный лимит mybb - 1000 элементов.


Выбрать элементы, используя дополнительные фильтры
--------------------------------------------------
После отбора элементов по стандартным параметрам дальше скрипт самостоятельно фильтрует
элементы по дополнитлеьным критериям. Все параметры, кроме ```additionalFilters``` 
совпадают с методом ```findAll```.
```js
    async findFiltered(
                       entityType,
                       nativeFilters = null,
                       additionalFilters = null,
                       fields = [],
                       sortBy = null,
                       sortDir = null,
                       limit = null
                       )
```

```additionalFilters```  - объект с вложенными объектами. Ключи верхнего уровня - 
названия полей. Вложенные объекты состоят из ключей "операнд" (```op```) и значение
(```value```). Пример:  
```js
{
    {
        last_post_date: {
            op: 'gte',
            value: Math.floor((Date.now() / 1000 - 1209600))  
        },
        num_replies: {
            op: 'gt',
            value: 0
        }
    }
}
```
Возможные значения для операндов: 

```eq``` - равно (equal)   
```gt``` - больше чем (greater than)  
```gte``` - больше или равно (greater than or equal)  
```lt``` - меньше чем (less than)  
```lte``` - меньше или равно (less than or equal)

Обертки над методом:
```js
async findFilteredUsers( nativeFilters = null,
                              additionalFilters = null,
                              fields = [],
                              sortBy = null,
                              sortDir = null,
                              limit = null)
```
```js
async findFilteredPosts( nativeFilters = null,
                              additionalFilters = null,
                              fields = [],
                              sortBy = null,
                              sortDir = null,
                              limit = null)
```
```js
async findFilteredTopics( nativeFilters = null,
                              additionalFilters = null,
                              fields = [],
                              sortBy = null,
                              sortDir = null,
                              limit = null) 
```

Дополнительные методы
---------------------
``` formTopicUrl(id)``` - вернет ссылку на первую страницу топика по id  
```formPostUrl(id)```  - вернет ссылку на конкретный пост по id  
```toTimestamp(strDate)``` - превращает дату в виде строки в Unix timestamp. 
Mybb API возвращает даты в формате Unix timestamp.  
```dateFormat(timestamp)```  - превращает даты формата Unix timestamp в даты
формата ```YYYY-mm-dd HH:ii:ss```

Как использовать
=================
Адрес файла на CDN  - https://cdn.jsdelivr.net/gh/viper-f/scripts@latest/mybb-api/MybbAPI.js  

Чтобы подключить файл в свой скрипт, скрипту нужно добавить тип "модуль",
а затем импортировать класс:
```js
<script type="module">
import MybbAPI from 'https://cdn.jsdelivr.net/gh/viper-f/scripts@latest/mybb-api/MybbAPI.js';

const mybbapi = new MybbAPI();
let topics = await mybbapi.findFilteredTopis(
    {
        forum_id: [1,2,3,4,5],
    },
    {
        last_post_date: {
            op: 'gte',
            value: Math.floor((Date.now() / 1000 - 1209600))  //129600 - number of seconds in 14 days
        },
        num_replies: {
            op: 'gt',
            value: 0
        }
    },
    ["id", "subject", "last_username"],
    "posted",
    "DESC");

    const wrapper = document.getElementById('wrapper')
    for (const topic of topics) {
    const url = mybbapi.formTopicUrl(topic.id);
    wrapper.innerHTML += `<li class="episodes-list-item"><a href="${url}">${topic.subject}</a> <span>${topic['last_username']}</span></li>`
    }
<script>
```