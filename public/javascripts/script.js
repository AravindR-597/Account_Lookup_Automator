const search=document.getElementById('search');
const matchList=document.getElementById('list');

const searchAcc=async searchText =>{
 const res =await fetch('data.json');
 const data =await res.json();


let matches =data.filter(account =>{
    const regex =new RegExp(`^${searchText}`,'gi');
    return account.Name.match(regex);
});

if(searchText.length===0){
    matches =[];
    matchList.innerHTML='';
}
outputHtml(matches);
};

const outputHtml =matches =>{
    if(matches.length>0){
        const html =matches.map(match =>`
        <div class="card card-body mb-1">
        <h3>${match.Name}</h3>
        <h2 > <span class="text-primary">${match.Number}</span></h2>
        <h4>Amount: ${match.Denomination} </h4>
        <button copy("${match.Number}") class="btn btn-outline-danger">Copy</button>
        </div>
        `)
        .join('');
        
        matchList.innerHTML=html;
    }
}
search.addEventListener('input',()=> searchAcc(search.value));

