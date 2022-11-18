/// <reference path="jquery-1.9.1.intellisense.js" />
//Load Data in Table when documents is ready
$(document).ready(function () {
    loadData();
});

//Load Data function
function loadData() {
    $.ajax({
        url: "/Players/List",
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            var html = '';
            $.each(result, function (key, player) {
                html += '<tr>';
                html += '<td>' + player.ID + '</td>';
                html += '<td>' + player.PlayerID + '</td>';
                //html += '<td>' + player.Name + '</td>';
                //html += '<td>' + player.Age + '</td>';                
                //html += '<td>' + player.Country + '</td>';
                html += '<td><a href="#" onclick="return GetbyID(' + player.ID + ')">Edit</a> | <a href="#" onclick="Delele(' + player.ID + ')">Delete</a></td>';
                html += '</tr>';
            });
            $('.tbody').html(html);
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
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
    var playerObj = {
        ID: $('#ID').val(),
        PlayerID: $('#PlayerID').val(),
        //Name: $('#Name').val(),
        //Age: $('#Age').val(),       
        //Country: $('#Country').val()
    };
    $.ajax({
        url: "/Players/Add",
        data: JSON.stringify(playerObj),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            loadData();
            $('#myModal').modal('hide');
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

//Function for getting the Data Based upon ID
function GetbyID(ID) {
    $('#PlayerID').css('border-color', 'lightgrey');
    //$('#Name').css('border-color', 'lightgrey');
    //$('#Age').css('border-color', 'lightgrey');   
    //$('#Country').css('border-color', 'lightgrey');
    $.ajax({
        url: "/Players/GetbyID/" + ID,
        typr: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (result) {
            $('#ID').val(result.ID);
            $('#PlayerID').val(result.PlayerID);
            //$('#Name').val(result.Name);
            //$('#Age').val(result.Age);           
            //$('#Country').val(result.Country);

            $('#myModal').modal('show');
            $('#btnUpdate').show();
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
    var playerObj = {
        ID: $('#ID').val(),
        PlayerID: $('#PlayerID').val(),
        //Name: $('#Name').val(),
        //Age: $('#Age').val(),       
        //Country: $('#Country').val(),
    };
    $.ajax({
        url: "/Players/Update",
        data: JSON.stringify(playerObj),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            loadData();
            $('#myModal').modal('hide');
            $('#ID').val
            $('#PlayerID').val("");
            //$('#Name').val("");
            //$('#Age').val("");
            //$('#State').val("");
            //$('#Country').val("");
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
            url: "/Players/Delete/" + ID,
            type: "POST",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            success: function (result) {
                loadData();
            },
            error: function (errormessage) {
                alert(errormessage.responseText);
            }
        });
    }
}



//Function for clearing the textboxes
function clearTextBox() {
    $('#PlayerID').val("");
    //$('#Name').val("");
    //$('#Age').val("");
    //$('#Country').val("");
    $('#btnUpdate').hide();
    $('#btnAdd').show();
    //$('#Name').css('border-color', 'lightgrey');
    //$('#Age').css('border-color', 'lightgrey');
    $('#PlayerID').css('border-color', 'lightgrey');
    //$('#Country').css('border-color', 'lightgrey');
}
//Valdidation using jquery
function validate() {
    var isValid = true;
    if ($('#PlayerID').val().trim() == "") {
        $('#PlayerID').css('border-color', 'Red');
        isValid = false;
    }
    else {
        $('#PlayerID').css('border-color', 'lightgrey');
    }
    //if ($('#Name').val().trim() == "") {
    //    $('#Name').css('border-color', 'Red');
    //    isValid = false;
    //}
    //else {
    //    $('#Name').css('border-color', 'lightgrey');
    //}
    //if ($('#Age').val().trim() == "") {
    //    $('#Age').css('border-color', 'Red');
    //    isValid = false;
    //}
    //else {
    //    $('#Age').css('border-color', 'lightgrey');
    //}    
    //if ($('#Country').val().trim() == "") {
    //    $('#Country').css('border-color', 'Red');
    //    isValid = false;
    //}
    //else {
    //    $('#Country').css('border-color', 'lightgrey');
    //}
    return isValid;
}