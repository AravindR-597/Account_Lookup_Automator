function plusFunction(id){
    console.log("iamhere")
    $.ajax({
        url:'/plusFunction/'+id,
        method:'get',
        success:(response)=>{
            alert(response)
            }
            
        })
}

function minusFunction(id){
    $.ajax({
        url:'/minusFunction/'+id,
        method:'get',
        success:(response)=>{
            alert(response)
        }
    })
}
function addToList(id){
    $.ajax({
        url:'/addToList/'+id,
        method:'get',
        success:(response)=>{
            alert(response)
        }
    })
}
