// API 키 설정
const apiKey = "IDS3A9QP-IDS3-IDS3-IDS3-IDS3A9QPCJ"; // 어린이대상 범죄주의구간 API 키
const elderApiKey = "OWB0YJ7I-OWB0-OWB0-OWB0-OWB0YJ7IUX"; // 노인대상 범죄주의구간 API 키
const rapeApiKey = "M1D2C748-M1D2-M1D2-M1D2-M1D2C748SD"; // 성폭력 범죄주의구간 API 키

// WMS 요청 변수 설정 (어린이대상 범죄주의구간)
const kidLayerName = "A2SM_ODBLRCRMNLHSPOT_KID";
const kidStyleName = "A2SM_OdblrCrmnlHspot_Kid";
const kidWmsUrl = `https://www.safemap.go.kr/openApiService/wms/getLayerData.do?apikey=${apiKey}`;

// WMS 요청 변수 설정 (노인대상 범죄주의구간)
const elderLayerName = "A2SM_ODBLRCRMNLHSPOT_ODSN";
const elderStyleName = "A2SM_OdblrCrmnlHspot_Odsn";
const elderWmsUrl = `https://www.safemap.go.kr/openApiService/wms/getLayerData.do?apikey=${elderApiKey}`;

// WMS 요청 변수 설정 (성폭력 범죄주의구간)
const rapeLayerName = "A2SM_CRMNLHSPOT_TOT";
const rapeStyleName = "A2SM_CrmnlHspot_Tot_Rape";
const rapeWmsUrl = `https://www.safemap.go.kr/openApiService/wms/getLayerData.do?apikey=${rapeApiKey}`;

// 지도 생성
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM() // 기본 지도 레이어
        }),
        new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: kidWmsUrl,
                params: {
                    'LAYERS': kidLayerName,
                    'STYLES': kidStyleName,
                    'FORMAT': 'image/png',
                    'TRANSPARENT': true
                },
                serverType: 'geoserver'
            }),
            visible: false // 기본적으로 어린이대상 범죄주의구간은 숨김
        }),
        new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: elderWmsUrl,
                params: {
                    'LAYERS': elderLayerName,
                    'STYLES': elderStyleName,
                    'FORMAT': 'image/png',
                    'TRANSPARENT': true
                },
                serverType: 'geoserver'
            }),
            visible: false // 기본적으로 노인대상 범죄주의구간은 숨김
        }),
        new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: rapeWmsUrl,
                params: {
                    'LAYERS': rapeLayerName,
                    'STYLES': rapeStyleName,
                    'FORMAT': 'image/png',
                    'TRANSPARENT': true
                },
                serverType: 'geoserver'
            }),
            visible: false // 기본적으로 성폭력 범죄주의구간은 숨김
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([126.9784, 37.5665]), // 서울 시청 기준
        zoom: 12
    })
});

// 레이어 표시/숨기기 기능
document.getElementById('toggleKidLayer').addEventListener('click', () => {
    toggleLayerVisibility(1); // 어린이대상 범죄주의구간 레이어
});

document.getElementById('toggleElderLayer').addEventListener('click', () => {
    toggleLayerVisibility(2); // 노인대상 범죄주의구간 레이어
});

document.getElementById('toggleRapeLayer').addEventListener('click', () => {
    toggleLayerVisibility(3); // 성폭력 범죄주의구간 레이어
});

// 범죄주의구간 레이어 표시/숨기기
function toggleLayerVisibility(layerIndex) {
    const layer = map.getLayers().item(layerIndex);
    layer.setVisible(!layer.getVisible());
    updateButtonState(layerIndex, layer.getVisible());
}

// 버튼 상태 업데이트
function updateButtonState(layerIndex, isVisible) {
    const button = document.querySelectorAll("button")[layerIndex - 1]; // 버튼 인덱스와 레이어 인덱스 매칭
    if (isVisible) {
        button.innerHTML += " ✅"; // 체크 표시 추가
    } else {
        button.innerHTML = button.innerHTML.replace(" ✅", ""); // 체크 표시 제거
    }
}

// 내 위치 찾기
document.getElementById('location').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const coords = position.coords;
            const userLocation = ol.proj.fromLonLat([coords.longitude, coords.latitude]);

            // 기존에 추가된 마커 삭제 (새로운 위치가 선택될 때마다 마커를 새로 추가)
            const layers = map.getLayers();
            layers.forEach((layer) => {
                if (layer instanceof ol.layer.Vector) {
                    map.removeLayer(layer);
                }
            });

            // 내 위치를 빨간 점으로 표시 (점 크기 줄이기)
            const marker = new ol.Feature({
                geometry: new ol.geom.Point(userLocation)
            });
            const vectorSource = new ol.source.Vector({
                features: [marker]
            });
            const vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6, // 점 크기 줄이기
                        fill: new ol.style.Fill({ color: 'red' }),
                        stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                    })
                })
            });
            map.addLayer(vectorLayer);

            // 지도의 중심을 내 위치로 설정하고 줌 레벨을 14로 설정
            map.getView().setCenter(userLocation);
            map.getView().setZoom(14);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});
