// register any custom projections we might need; proj4 will be loaded before this script
if(window.proj4){
  // BC Albers / EPSG:3005 (longitude/latitude will be calculated from metres)
  proj4.defs("EPSG:3005","+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 \
      +lon_0=-126 +x_0=1000000 +y_0=0 +datum=NAD83 +units=m +no_defs");
}

window.APP_CONFIG = {
  "map": {
    "initialView": {
      "center": [
        53.7267,
        -127.6476
      ],
      "zoom": 5
    },
    "bcView": {
      "center": [
        53.7267,
        -127.6476
      ],
      "zoom": 5
    },
    "resetView": {
      "center": [
        53.7267,
        -127.6476
      ],
      "zoom": 5
    }
  },
  "basemaps": {
    "osm": {
      "label": "OpenStreetMap",
      "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "options": {
        "maxZoom": 19,
        "attribution": "&copy; OpenStreetMap"
      }
    },
    "topo": {
      "label": "Topo",
      "url": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      "options": {
        "maxZoom": 17,
        "attribution": "&copy; OpenTopoMap"
      }
    },
    "sat": {
      "label": "Satellite",
      "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      "options": {
        "maxZoom": 19,
        "attribution": "Tiles &copy; Esri"
      }
    },
    "gray": {
      "label": "Light Gray",
      "url": "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      "options": {
        "maxZoom": 19,
        "attribution": "Tiles &copy; Esri"
      }
    }
  },
  "menus": [
    {
      "id": "active",
      "title": "Active",
      "layers": [
        {
          "id": "active_fires",
          "label": "Active Fires (cluster)",
          "type": "geojson",
          "path": "./data/active/active_fires.geojson",
          "defaultOn": true,
          "renderer": {
            "kind": "circle",
            "radius": 6,
            "fillOpacity": 0.75
          },
          "popupFields": [
            {
              "label": "Name",
              "field": "incident_name"
            },
            {
              "label": "Discovered",
              "field": "discovered_date"
            },
            {
              "label": "Size (ha)",
              "field": "size_ha"
            }
          ],
          "legend": {
            "label": "Active fire",
            "swatch": "#ff6b6b"
          }
        }
      ]
    },
    {
      "id": "boundaries",
      "title": "Boundaries",
      "layers": [
        {
          "id": "fire_areas",
          "label": "Fire Management Areas",
          "type": "geojson",
          // once the source file is converted to EPSG:3005, this tells loader how to reproject
          "srcCrs": "EPSG:3005",
          "path": "./data/boundaries/fire_management_poly.geojson",
          "defaultOn": true,
          "renderer": {
            "kind": "polygon",
            "weight": 1,
            "fillOpacity": 0.12
          },
          "popupFields": [
            {
              "label": "Name",
              "field": "name"
            },
            {
              "label": "Area(SQKM)",
              "field": "area_sqkm"
            },
            {
              "label": "Length(KM)",
              "field": "length_km"
            }
          ],
          "onClick": "showMonthlyChart",
          "legend": {
            "label": "Management area",
            "swatch": "#74c0fc"
          }
        }
      ]
    },
    {
      "id": "historical",
      "title": "Historical",
      "layers": [
        {
          "id": "fires_2020",
          "label": "Historical Fires 2020",
          "type": "geojson",
          "path": "./data/historical/fires_2020.geojson",
          "defaultOn": false,
          "renderer": {
            "kind": "circle",
            "radius": 4,
            "fillOpacity": 0.45
          },
          "popupFields": [
            {
              "label": "ID",
              "field": "id"
            },
            {
              "label": "Month",
              "field": "month"
            },
            {
              "label": "Size (ha)",
              "field": "size_ha"
            }
          ],
          "legend": {
            "label": "Historical fire",
            "swatch": "#ffd43b"
          }
        }
      ]
    }
  ]
};
