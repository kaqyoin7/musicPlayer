const changeIcon = document.querySelector('.change');
const artistsList = document.querySelector('.artists-list');

// 使用事件委托处理点击事件
artistsList.addEventListener('click', function(e) {
  const target = e.target;
  const icon = target.closest('.icon');
  const likeBtn = target.closest('.like');
  
  if (icon) {
    const shadow = icon.querySelector('.shadow');
    const likeBtn = icon.parentElement.querySelector('.like');
    
    shadow.classList.toggle('selected');
    likeBtn.classList.toggle('selected');
    likeBtn.textContent = shadow.classList.contains('selected') ? '已喜欢' : '喜欢';
  } else if (likeBtn) {
    const icon = likeBtn.parentElement.querySelector('.icon');
    const shadow = icon.querySelector('.shadow');
    
    shadow.classList.toggle('selected');
    likeBtn.classList.toggle('selected');
    likeBtn.textContent = shadow.classList.contains('selected') ? '已喜欢' : '喜欢';
  }
});

changeIcon.addEventListener('click', function() {
    fetch('/singer/random')
      .then(function(response) {
        return response.json();
      })
      .then(function(body) {
        if (!body) {
          return;
        }

        function createItem(item) {
          const li = document.createElement('li');
          li.innerHTML = `
            <div class="icon" style="background:url(${item.avatar}) no-repeat center;background-size: contain;">
                <div class="shadow"></div>
            </div>
            <h4>${item.name}</h4>
            <div class="like">喜欢</div>`;
          return li;
        }

        artistsList.innerHTML = '';
        for (const singerItem of body) {
          console.log(singerItem);
          const li = createItem(singerItem);
          artistsList.appendChild(li);
        }
      });
});

                //add
// 保存当前是否选中的状态
let isSelected = false;

// 获取整个元素的节点
const box = document.querySelector('.icon');

// 获取select框节点
const select = document.querySelector('.check');

// 给整个元素添加点击事件
box.addEventListener('click', function () {
  // 点击以后触发这个函数

  // 修改当前选中状态，取反即可
  isSelected = !isSelected;

  // 如果当前是选中状态、则添加img到select中
  if (isSelected) {
    // 创建一个img标签节点
    const img = document.createElement('img');

    // 设置img的src属性和样式，让其撑满select框
    img.src = '../assets/images/affirm.png';
    img.setAttribute('style', 'width: 100%; height: 100%;');

    img.setAttribute('style', 'display:block; background-color:white ; border-radius:50%； width: 15px; height: 20.45px; position:absolute; top:210px; left:240px;');

    // 将这个节点添加到select框中
    // select.appendChild(img);
    select.appendChild(img);

  } else {
    // 如果不是选择状态，则清空内部子元素
    select.innerHTML = '';
  }
});