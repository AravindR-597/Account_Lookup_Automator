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
            if(response.status){
                alertify.success('Added Successfully');
            }
        }
    })
}
function deleteFromList(id){
    $.ajax({
        url:'/deleteFromList/'+id,
        method:'get',
        success:(response)=>{
            if(response.status){
                alertify.confirm("Do you want to delete this account from the list.",
                function(){
                  alertify.success('Ok');
                },
                function(){
                  alertify.error('Cancel');
                });
            }
        }
    })
}