/// <reference path="jquery-1.9.1.intellisense.js" />
//Load Data in Table when documents is ready
$(document).ready(function () {
    loadData();
    loadList();
});

//Load Data function
function loadData() {
    $.ajax({
        url: "/Users/List",
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            var html = '';
            $.each(result, function (key, user) {
                html += '<tr>';
                //html += '<td>' + player.ID + '</td>';
                //html += '<td>' + user.UserID + '</td>';
                html += '<td>' + user.CasinoKiosk_UserName + '</td>';
                html += '<td>' + user.isActive + '</td>';
                html += '<td>' + user.UserEmailAddress + '</td>';
                html += '<td>' + user.RoleName + '</td>';
                html += '<td><a href="#" onclick="return GetbyID(' + user.UserID + ')">Edit</a> | <a href="#" onclick="Delele(' + user.UserID + ')">Delete</a></td>';
                html += '</tr>';
            });
            $('.tbody').html(html);

            $('#CasinoKioskUserGrid').DataTable({
                "order": [[0, "desc"]]
            });
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

function loadList() {
    $.ajax({
        type: "GET",
        url: "/Users/selectList",
        data: "{}",
        success: function (data) {
            var s = '<option value="-1">Select Role</option>';
            for (var i = 0; i < data.length; i++) {
                s += '<option value="' + data[i].RoleId + '">' + data[i].RoleName + '</option>';
            }
            $("#RoleName").html(s);
        }
    });
}

//Insert Data Function 
function Add()
{
    var res = validate();
    if (res == false) {
        return false;
    }    
    var userObj = {       
       UserID: $('#UserID').val(),
       CasinoKiosk_UserName: $('#CasinoKiosk_UserName').val(),
       isActive: $('#isActive').prop('checked') == true ? "true" : "false",
       UserEmailAddress: $('#UserEmailAddress').val(),
       RoleName: $('#RoleName option:selected').text(),
       RoleId: $('#RoleName').val(),
       UserRoleId: $('#UserRoleId').val()
    };
    $.ajax({
        url: "/Users/Add",
        data: JSON.stringify(userObj),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            loadData();
            loadList();
            $('#myModal').modal('hide');
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

//Function for getting the Data Based upon ID
function GetbyID(ID) {
    
    //$('#CasinoKiosk_UserName').css('border-color', 'lightgrey');
    //$('#isActive').css('border-color', 'lightgrey');   
    //$('#UserEmailAddress').css('border-color', 'lightgrey');
    

    $.ajax({
        url: "/Users/GetbyID/" + ID,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (result) {
            $('#UserID').val(result.UserID);
            $('#CasinoKiosk_UserName').val(result.CasinoKiosk_UserName);
            $('#isActive').prop('checked', result.isActive);
            $('#UserEmailAddress').val(result.UserEmailAddress);
            //loadList();
            $('#RoleName').val(result.RoleId);
            $('#UserRoleId').val(result.UserRoleId);
            $('#RoleId').val(result.RoleId);
            
            //alert($('#RoleName').val(result.RoleId));
            
            //$("#RoleName").append(new Option("option text", "value"));

            $('#myModal').modal('show');
            $('#btnUpdate').show();
            $('#myModalLabel').text("Update User")
            $('#btnAdd').hide();           
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
    return false;
}

//function for updating player's record
function Update() {
    var res = validate();
    if (res == false) {
        return false;
    }
    var userObj = {
        UserID: $('#UserID').val(),
        CasinoKiosk_UserName: $('#CasinoKiosk_UserName').val(),
        //isActive: $('#isActive option:selected').val(),
        isActive: $('#isActive').prop('checked') == true ? "true" : "false",
        UserEmailAddress: $('#UserEmailAddress').val(),
        RoleName: $('#RoleName option:selected').text(),
        RoleId: $('#RoleName').val(),
        UserRoleId: $('#UserRoleId').val()
    };
    //alert($('#RoleId').val());
    $.ajax({
        url: "/Users/Update",
        data: JSON.stringify(userObj),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            loadData();
            loadList();
            $('#myModal').modal('hide');           
            $('#UserID').val();
            $('#CasinoKiosk_UserName').val();
            $('#isActive').val();          
            $('#UserEmailAddress').val();
            $('#RoleName').text();
            
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

//function for deleting player's record
function Delele(ID) {
    var ans = confirm("Are you sure you want to delete this Record?");
    if (ans) {
        $.ajax({
            url: "/Users/Delete/" + ID,
            type: "POST",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            success: function (result) {
                loadData();
                loadList();
            },
            error: function (errormessage) {
                alert(errormessage.responseText);
            }
        });
    }
}



//Function for clearing the textboxes
function clearTextBox() {
    $('#UserID').val(0);
    $('#CasinoKiosk_UserName').val("");
    $('#isActive').prop('checked', 0);
    $('#UserEmailAddress').val("");
    //$('#RoleName').val();
    $('#UserRoleId').val(0);
    $('#RoleId').val(0);
    $('#btnUpdate').hide();
    $('#btnAdd').show();
    
    loadList();

    $('#myModalLabel').text("Add User")

    //$('#UserID').css('border-color', 'lightgrey');
    $('#CasinoKiosk_UserName').css('border-color', 'lightgrey');
    $('#isActive').css('border-color', 'lightgrey');
    $('#UserEmailAddress').css('border-color', 'lightgrey');
    $('#RoleName').css('border-color', 'lightgrey');
}
//Valdidation using jquery
function validate() {
    var isValid = true;
    //if ($('#UserID').val().trim() == "") {
    //    $('#UserID').css('border-color', 'Red');
    //    isValid = false;
    //}
    //else {
    //    $('#UserID').css('border-color', 'lightgrey');
    //}
    if ($('#CasinoKiosk_UserName').val().trim() == "") {
        $('#CasinoKiosk_UserName').css('border-color', 'Red');
        isValid = false;
    }
    else {
        $('#CasinoKiosk_UserName').css('border-color', 'lightgrey');
    }
    if ($('#isActive').val().trim() == "") {
        $('#isActive').css('border-color', 'Red');
        isValid = false;
    }
    else {
        $('#isActive').css('border-color', 'lightgrey');
    }    
    if ($('#UserEmailAddress').val().trim() == "") {
        $('#UserEmailAddress').css('border-color', 'Red');
        isValid = false;
    }
    else {
        $('#UserEmailAddress').css('border-color', 'lightgrey');
    }
    if ($('#RoleName option:selected').text() == "Select Role") {
        $('#RoleName').css('border-color', 'Red');
        isValid = false;
        //alert($('#RoleName option:selected').text());
    }
    else {
        $('#RoleName').css('border-color', 'lightgrey');
              
    }
    return isValid;
}