function plusFunction(id){
    $.ajax({
        url:'/plusFunction/'+id,
        method:'get',
        success:(response)=>{
            if (response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }
            
        }
    })
}

function minusFunction(id){
    $.ajax({
        url:'/minusFunction/'+id,
        method:'get',
        success:(response)=>{
            if (response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }
            
        }
    })
}
