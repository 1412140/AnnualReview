$(document).ready(function () {
    displayManagerInfo(false);
    $('#btnSubmitDlg').hide();
    //$('#manaId').focusout(function () {
    //    changeManager();
    //})
    $('#manaId').change(function () {
        if ($('#manaId').val().length == 0) {
            displayManagerInfo(false);
        }
    })

    $("#selfComment").Editor();
    $("#staffPerComment").Editor();
    $("#managerComment").Editor();
    $("#managerPerComment").Editor();
    $("#staffComment").Editor();
    $("#staffGoalsComment").Editor();
    getInitData();
    $(".name-signature").focusout(function () {
        $(".name-signature").css("border", "none");
        $(".name-signature").css("background", "#dae6f3");
    });
});

function getInitData() {
    $.ajax({
        type: 'GET',
        url: '/Employee/getInitData',
        catche: false,
        data: {
            id: $("#employeeNo").val(),
            managerId: $("#manaId").val()
        },
        dataType: "json",
        success: function (data) {

            //display User loggin
            $("#imgEmpLoggin").attr("src", data.empData.EmployeeImage);


            //display all Manager Name
            if (data.managerModel.EmployeeID) {
                $('#manaId').val(data.managerModel.EmployeeID);
                displayManagerInfo(true);
                changeManager();
            }


            //display Department Name
            $('#departName').html(data.infoOther.departName);

            //display Signature
            $('#empSign').val(data.revDetail.Signature == null ? (data.empData.FullName + "").toLowerCase() : data.revDetail.Signature);

            if (data.revDetail) {
                $('#staffComtArea .Editor-editor').html(decodeURIComponent(data.revDetail.StaffComments == null ? '' : data.revDetail.StaffComments));

                loadDataSubmit(data.infoOther.isSubmited);

                if (data.infoOther.isSubmited) {
                    $('#staffComtArea .Editor-editor').attr('contenteditable', false);
                } else {
                    if (data.infoOther.isReviewed) {
                        $('#staffComtArea .Editor-editor').attr('contenteditable', true);
                    } else {
                        $('#staffComtArea .Editor-editor').attr('contenteditable', false);
                    }
                }

            } else {
                $('#btnManaRev').css('pointer-events', 'none');
                $('#staffComtArea .Editor-editor').attr('contenteditable', false);
            }
            //display button submit
            if (!data.infoOther.isSaved) {
                $('#btnSubmit').hide();
            }


            // button Manager assessment 
            if (data.infoOther.isReviewed) {
                $('#manaRev').html('Reviewed');
                $('#btnManaRev').prop('disabled', false);
                $('#contManaRev').css('pointer-events', 'auto');
            } else {
                $('#btnManaRev').prop('disabled', true);
                $('#contManaRev').css('pointer-events', 'none')
            }
        }
    });
}

function openReviewed() {
    let empId = $("#empId").text();
    $.ajax({
        type: 'POST',
        url: '/Employee/openReviewed',
        catche: false,
        data: {
            empId: empId
        },
        dataType: "json",
        success: function (result) {
            clearRadio();
            $('#managerModal').modal('show');
            $('#signDateM').html(convertDateFromCsToJs(result.UpdatedTime));
            $('#manaSign').val(result.ManagerSignature);
            $('#EmpManaArea').hide();
            displayTextEditor('#managerArea .Editor-editor', decodeURIComponent(result.ManagerAssessment == null ? '' : result.ManagerAssessment), true);
            displayTextEditor('#managerPerArea .Editor-editor', decodeURIComponent(result.ManagerPerformanceSummary == null ? '' : result.ManagerPerformanceSummary), true);
            showRadio(result.Criteria12, "rdJobKnowS");
            showRadio(result.Criteria13, "rdTeamPlayer");
            showRadio(result.Criteria14, "rdProfessionS");
            showRadio(result.Criteria15, "rdDependa");
            $('#manaAreaComt').css("pointer-events", "none");
           // $('#btnSave').hide();
        }
    });
}

function changeManager() {
    $.ajax({
        type: 'GET',
        url: '/Employee/getManagerInfo',
        catche: false,
        data: {
            id: $('#empId').html(),
            manaId: $('#manaId').val(),
        },
        dataType: "json",
        success: function (data) {
            if (data.FullName) {
                $("#checkManagerName").html('');
                $("#manaSign").val((data.FullName + "").toLowerCase())

                displayManagerInfo(true);
                $("#manaName").html(data.FullName);
                $("#manaPos").html(data.Position);

            } else {
                displayManagerInfo(false);
                $("#checkManagerName").html("Manager ID is not correct !!");
            }
        }
    });
}

function displayManagerInfo(isShow) {
    $("#manaName").html('');
    $("#manaPos").html('');
    if (isShow) {
        $("#manaName").show();
        $("#manaNameLb").show();
        $("#manaPos").show();
        $("#manaPosLb").show();
    } else {
        $("#manaName").hide();
        $("#manaNameLb").hide();
        $("#manaPos").hide();
        $("#manaPosLb").hide();
    }
}

function saveStaffReview(isSubmit) {
    let countErr = 0;

    if (!$('#manaName').html()) {
        $("#checkManagerName").html("*Please select your Manager!");
        countErr++;
    }

    if ($('#manaRev').html() == "Reviewed") {
        if ($('#staffComtArea .Editor-editor').html() != undefined) {
            if ($('#staffComtArea .Editor-editor').html().length < 120) {
                $('#checkStaffComment').html('Enter at least 120 character');
                countErr++;
            }
        }
    }

    if ($('#empSign').val() == "") {
        $('#checkEmpSign').html('Enter your signature');
        countErr++;
    }


    if (countErr == 0) {
        $.ajax({
            type: 'POST',
            url: '/Employee/saveStaffReview',
            catche: false,
            data: {

                EmployeeID: $("#empId").text(),
                SelfEvaluation: '',
                StaffPerformanceSummary: '',
                StaffGoals: '',
                StaffComments: encodeURIComponent($('#staffComtArea .Editor-editor').html()),
                ManagerId: $('#manaId').val(),
                empSign: $('#empSign').val(),
                isSubmit: isSubmit
            },
            dataType: "json",
            success: function (data) {
                $('#checkStaffComment').html('');
                $('#checkEmpSign').html('');
                $('#btnSubmit').show();
                if (data.isReviewed) {
                    $('#staffComtArea .Editor-editor').attr('contenteditable', true);
                } else {
                    $('#staffComtArea .Editor-editor').attr('contenteditable', false);
                }
                if (isSubmit) {
                    loadDataSubmit(true);
                }
                $('#submitSuccessModal').modal('show');
            }
        })
    }

}



function confirmDelete(empId) {
    $("#employeeEIDDel").val(empId);
    $('#deleteModalDg').modal('show');
}

function deleteSubmit() {
    $.ajax({
        type: 'POST',
        url: '/Manager/delEmployee',
        catche: false,
        data: {
            id: $("#employeeEIDDel").val()
        },
        dataType: "json",
        success: function (data) {
            //getInitData();
        }
    });
}

function displayStaffReview(revDetail) {

    $('#staffSelfArea .Editor-editor').html(revDetail.SelfEvaluation == null ? '' : decodeURIComponent(revDetail.SelfEvaluation));
    $('#staffSelfArea div[contenteditable="true"]').attr('contenteditable', false);
    $('#staffPerArea .Editor-editor').html(revDetail.StaffPerformanceSummary == null ? '' : decodeURIComponent(revDetail.StaffPerformanceSummary));
    $('#staffPerArea div[contenteditable="true"]').attr('contenteditable', false);

    $('#staffGoalsArea .Editor-editor').html(revDetail.StaffGoals == null ? '' : decodeURIComponent(revDetail.StaffGoals));
    $('#staffGoalsArea div[contenteditable="true"]').attr('contenteditable', false);
    $('#staffComtArea .Editor-editor').html(revDetail.StaffComments == null ? '' : decodeURIComponent(revDetail.StaffComments));
    $('#staffComtArea div[contenteditable="true"]').attr('contenteditable', false);

    $('#signDate').html(convertDateFromCsToJs(revDetail.UpdatedTime));
}


function showRadio(criteria, name) {
    $('#' + name + criteria).click();
}
function clearRadio() {
    $(`input[name=rdJobKnowS]`).attr('checked', false);
    $(`input[name=rdTeamPlayer]`).attr('checked', false);
    $(`input[name=rdProfessionS]`).attr('checked', false);
    $(`input[name=rdDependa]`).attr('checked', false);
}

function saveReview() {
    let countErr = 0;
    if ($('#managerArea div[contenteditable="true"]').html() != undefined) {
        if ($('#managerArea div[contenteditable="true"]').html().length < 120) {
            $('#checkManagerComment').html('Enter at least 120 character');
            countErr++;
        }
    }

    if ($('#managerPerArea div[contenteditable="true"]').html() != undefined) {
        if ($('#managerPerArea div[contenteditable="true"]').html().length < 120) {
            $('#checkManagerPerComment').html('Enter at least 120 character');
            countErr++;
        }

    }
    if (countErr == 0) {
        $.ajax({
            type: 'POST',
            url: '/Manager/saveReview',
            catche: false,
            data: {
                EmployeeID: $('#empEID').val(),
                ManagerAssessment: getTextAll('#managerArea div[contenteditable="true"] > span'),//$('#managerArea div[contenteditable="true"]').html(),
                ManagerPerformanceSummary: getTextAll('#managerPerArea div[contenteditable="true"] > span'),//$('#managerPerArea div[contenteditable="true"]').html(),
                Criteria12: $("input[type='radio'][name='rdJobKnowS']:checked").val(),
                Criteria13: $("input[type='radio'][name='rdTeamPlayer']:checked").val(),
                Criteria14: $("input[type='radio'][name='rdProfessionS']:checked").val(),
                Criteria15: $("input[type='radio'][name='rdDependa']:checked").val(),

            },
            success: function (data) {
                $('#checkManagerComment').html('');
                $('#checkManagerPerComment').html('');
                $('#updSuccessModal').modal('show');
                $('#btnSubmit').show();
            }
        });
    }

}

function getTextAll(id) {
    var spans = document.querySelectorAll(id);
    let str = '';

    for (var i = 0, l = spans.length; i < l; i++) {
        str += spans[i].textContent || spans[i].innerText + " ";
    }
    return str;
}

function displayTextEditor(name, value, status) {
    $(name).html(value);
    $(name).attr('contenteditable', status);
}

function loadDataSubmit(isSubmit) {
    if (isSubmit) {
        //$('#managerName').prop('disabled', true);
        $('#btnSubmit').prop('disabled', true);
        $('#btnSave').prop('disabled', true);
        $('#manaId').prop('disabled', true); 
        $('#btnCheck').prop('disabled', true);
        $('#staffComtArea .Editor-editor').attr('contenteditable', false);
    } else {
        //$('#managerName').prop('disabled', false);
        $('#btnSubmit').prop('disabled', false);
        $('#btnSave').prop('disabled', false);
        $('#manaId').prop('disabled', false);
        $('#btnCheck').prop('disabled', false);
        $('#staffComtArea .Editor-editor').attr('contenteditable', true);
    }
}

function convertDateFromCsToJs(value) {
    if (value) {
        var pattern = /Date\(([^)]+)\)/;
        var results = pattern.exec(value);
        var dt = new Date(parseFloat(results[1]));
        return dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
    } else {
        var date = new Date();
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }
}