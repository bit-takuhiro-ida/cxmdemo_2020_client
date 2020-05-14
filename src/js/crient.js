import $ from 'jquery';
import axios from 'axios';
import CXHttpUtils from 'cx_common_lib/commonModules/CXHttpUtils.js'
import CXDateFormat from 'cx_common_lib/commonModules/CXDateFormat'
import cxm_core from "qisz-cxm-core";
import info_teplate from '../template/info.hbs';

// 設定jsonのURL
const conf_json_url = 'json/conf.json';

// ユーザーネーム
let nickname = "";

// 初回フラグ
let first_flg = true;

// 日付フォーマッター
let _df = new CXDateFormat('yyyy/MM/dd hh:mm:ss.sss')

$(function(){
    console.log("crient.js");
    axios.get(conf_json_url + '?' + CXHttpUtils.createCacheParam()).then((res)=>{
        console.log(res.data);
        init(res.data);
        addLinstner(res.data);
        
    })
})

/*
* 初期化処理
*/
const init = (conf) => {
    console.log("init() ----")
    console.log(conf)

    // ----------------------------------------------------------
    // CxMの設定

    let cxmObj;
    let args = {};
    const _interval = 300;

    // 状態json(sloth)のURL
    // args.statecheck_url = conf.statecheck_url;
    // args.statecheck_url = CXHttpUtils.addURLParams(conf.statecheck_url,{'_____randprm':CXHttpUtils.createCacheParam(_interval)});
    args.statecheck_url = conf.statecheck_url;

    // 状態json(sloth)監視するポーリング間隔
    args.statecheck_interval = _interval;

    // イベント開始インターバル　プロパティ名
    args.prop_name_event_start_interval = 'game_start_interval';

    // 状態フラグ変更日時　プロパティ名
    args.prop_name_state_change_datetime = "startDateMS";
    
    // サーバータイム取得用ファイル の URL (必須の引数)
    args.timecheck_url = "./json/empty.json";


    // 準備状態になったときの処理
    args.event_func_ready = () => {
        // 準備状態
        console.log("event_func_ready ----")
        console.log(_df.format(new Date()))
        const checkData = cxmObj.getStateCheckData();
        console.log(checkData)
        setProgressBar(conf, checkData)
        
    };

    // 予定時間になる前の処理
    args.event_func_start_before = () => {
        // 予定時間になる前
        console.log("event_func_start_before ----")
        console.log(_df.format(new Date()))
    };

    // 予定時間にちょうどなったときの処理
    args.event_func_start_just = () => {
        // 予定時間にちょうどなった
        console.log("event_func_start_just ----")
        console.log(_df.format(new Date()))
        gotoGamePage(conf)
    };
    
    // 予定時間をすでに過ぎていたときの処理
    args.event_func_start_after = async () => {
        // 予定時間をすでに過ぎていた
        console.log("event_func_start_after ----")
        console.log(_df.format(new Date()))
        // effectStart();
        $("#close_area").addClass("show");
        $("#nickname_input_area").removeClass("show");
    };

    console.log(args)

    cxmObj = new cxm_core(args);
    cxmObj.exec();

    // ----------------------------------------------------------
    // 画像のプリロード
    for(let i=0;i<conf.preload_images.length;i++){
        CXHttpUtils.loadImage(conf.preload_images[i]);
    }

    // ----------------------------------------------------------
    // ユーザーネーム入力の表示
    $("#nickname_input_area").addClass("show");
}

/*
* 待機画面の情報表示
*/
const showInfo = () => {
    let html = info_teplate({"nickname":nickname});
    $("#wrapper main .info").html(html);
}

/*
* プログレスバー
*/
const setProgressBar = (conf, checkData) => {

    let _t = _df.parse(checkData.startDateMS).getTime() + checkData.game_start_interval - (new Date()).getTime();
    $("main .progress_bar_area").addClass("show");
    $("main .progress_bar_area .progress_bar").css({"transition-duration":_t + 'ms'});
    setTimeout(()=>{
        $("main .progress_bar_area .progress_bar").addClass("start");
    },100);

    setTimeout(()=>{
        $("main .progress_bar_area .progress_bar_base").addClass("hide");
        setTimeout(()=>{
            $("main .progress_bar_area .caption").addClass("show");
        },200);
    },_t - conf.progress_bar_switch_time);
}

/*
* リスナ登録
*/
const addLinstner = (conf) => {
    console.log("addLinstner() ----")

    // ニックネーム　登録ボタン
    $("#nickname_input_area .btn.entry").on("click", function(e){
        
        // ニックネーム取得
        nickname = $("#nickname_input").val();

        if(nickname.length > 8){
            console.log("文字数が多い！")
            // メッセージを表示する
            $("#nickname_input_area .input_area .caution").removeClass("hide");
        }else{
            // メッセージを非表示にする
            $("#nickname_input_area .input_area .caution").addClass("hide");

            console.log(nickname)
            if(!nickname){
                console.log("デフォルト名を取得する")
                nickname = getDefaultNickname(conf);
            }
            console.log(nickname)

            // 表示の切り替え
            $("#nickname_input_area").removeClass("show");
            if(first_flg){
                // 初回は説明を表示する
                first_flg = false;
                setTimeout(function(){
                    $("#description_area").addClass("show");
                },300)
            }else{
                // 
                showInfo();
            }
        }

    });

    // ニックネーム 戻るボタン
    $("#nickname_input_area .btn.return").on("click", function(e){
        $("#nickname_input_area").removeClass("show");
    });

    // 遊び方　閉じるボタン
    $("#description_area .btn.close").on("click", function(e){
        showInfo();
        $("#description_area").removeClass("show");
    });

    // ユーザーネーム 変更ボタン
    $("#wrapper main .info").on("click", "#nickname_btn", function(e){
         console.log("ユーザーネーム変更 ボタン クリック")
         $("#nickname_input_area .overlay_inner").scrollTop(0);
         $("#nickname_input_area .btn_area .btn.return").removeClass("hide");
         $("#nickname_input").val(nickname);
         $("#nickname_input_area").addClass("show");
    });

    // ゲームの説明を見る ボタン
    $("#wrapper main .info").on("click", "#description_btn", function(e){
        console.log("ゲームの説明を見る ボタン クリック")
        $("#description_area .overlay_inner").scrollTop(0);
        $("#description_area").addClass("show");
    });
}

/*
* リダイレクト処理
*/
const gotoGamePage = (conf) => {
    console.log("gotoGamePage() ----")
    // 入力がない場合、デフォルト名を取得する
    if(!nickname){
        console.log("デフォルト名を取得する")
        nickname = getDefaultNickname(conf);
    }

    // ユーザー名をlocalStorageに格納する
    localStorage.setItem(conf.localstorage_key, nickname);

    // 次ページに遷移する
    location.href = conf.gamepage_url;
}

/*
* デフォルト名取得
*/
const getDefaultNickname = (conf) => {
    const _arr = conf.default_nickname;
    const _idx = Math.floor(Math.random() * _arr.length);
    return _arr[_idx];
}