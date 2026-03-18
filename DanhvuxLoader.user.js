(function() {
    'use strict';
    
    console.log("Danhvux Hub Main Script is running...");

    // Tự động hiện Panel sau 1 giây (để chắc chắn trang web đã load xong)
    setTimeout(() => {
        const testDiv = document.createElement('div');
        testDiv.style.cssText = "position:fixed; top:20px; left:20px; z-index:999999; background:#ffea00; color:#000; padding:15px; border-radius:10px; font-weight:bold; box-shadow: 0 0 20px rgba(0,0,0,0.5);";
        testDiv.innerHTML = "🚀 DANHVUX HUB ĐÃ ONLINE!";
        document.body.appendChild(testDiv);
        
        // Chèn tiếp code giao diện v16 của bạn vào dưới này
    }, 1000);
})();
