window.onload = function () {
    let table = $("#userListTb");
    $.ajax({
        type: "get",
//            url: "http://localhost:30000/user/list",
        url: "http://yizicheng.cn:30000/user/list",
        data: {
            act: "getUserList"
        },
        dataType: "json",
        success: function (data) {


            let tempText = $("#listTemplate").html();
            $("#tableBox").html(ejs.render(tempText,{data:data}));
            table.addClass("table-striped");
            table.addClass("table-hover");

        },
        error: function (err) {

        }

    });


    $("body").on("click", ".deleteBtn", function () {
        let id = $(this).attr("id");
        let link = $(this).parents("tr");
        $.ajax({
            type: "delete",
            url: `http://yizicheng.cn:30000/user/delete?id=${id}`,
//                url: `http://localhost:30000/user/delete?id=${id}`,
            success: function (data) {
                if (data.ok) {
                    link.remove();
                }
            },
            error: function () {

            }
        })
    });
    $(".addContent").hide();

    $(".addBtn").click(function () {
        $(".addContent").show();
    });

    $("#submit").click(function () {
        let newUser = $("#newUser").val();
        let newPwd = $("#newPwd").val();
        $.ajax({
            type: "post",
            url: "http://yizicheng.cn:30000/user/add",
            data: {
                "newUser": newUser,
                "newPwd": newPwd
            },
            dataType: "json",
            success: function (data) {
                if (data.ok) {
                    let addContent =  $(".addContent");
                    addContent.find("input").val("");
                    addContent.hide();

                    let tdStr = `<tr><td>${newUser}</td><td><input type="text" class="pwdText" value="${newPwd}" disabled></td>
                                 <td><div class="btn-group"><button class="deleteBtn btn btn-default" id="${data.id}">删除</button> <button class="updateBtn btn btn-default" id="${data.id}">修改</button></div></td></tr>`;
                    $("#userListTb").append(tdStr);
                }
            },
            error: function (err) {

            }
        })
    });

    let oldInput = "";

    $("body").on("click", ".updateBtn", function () {
        let btnThis = $(this);
        let text = btnThis.text();
        let id = btnThis.attr("id");
        let link = btnThis.parents("tr").find("input");

        switch (text){
            case "修改":
                link.removeAttr("disabled");
                link.css("background","#d7d7d7");
                btnThis.text("保存");
                oldInput = link.val();
                break;
            case "保存":

                let update = link.val();
                console.log(oldInput + ":" + update);
                if(update === oldInput){

                    link.attr("disabled","disabled");
                    btnThis.text("修改");
                    link.css("background","none");
                    return;
                }

                $.ajax({
                    type: "post",
                    url: "http://yizicheng.cn:30000/user/update",
                    data: {
                        "id": id,
                        "update": update
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.ok){
                            link.attr("disabled","disabled");
                            btnThis.text("修改");
                            link.css("background","none");
                        }else{
                            link.attr("disabled","disabled");
                            link.val(oldInput);
                            btnThis.text("修改");
                            link.css("background","none");
                        }
                    },
                    error: function (err) {

                    }
                })
                break;
            default:
                break;
        }



//            link.css({"color":"red","border":"2px solid red"})

    })
}